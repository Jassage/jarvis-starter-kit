import { Prisma } from "@prisma/client";
import prisma from "../utils/prisma";
import { AppError } from "../types";
import { createAuditLog } from "../utils/audit";

async function genNumeroTransfert(
  tx: Prisma.TransactionClient,
): Promise<string> {
  await tx.$executeRawUnsafe(
    "CREATE SEQUENCE IF NOT EXISTS transfert_numero_seq",
  );
  const rows = await tx.$queryRawUnsafe<{ value: bigint | number }[]>(
    "SELECT nextval('transfert_numero_seq') AS value",
  );
  const value = Number(rows[0]?.value ?? 0);
  return `TRF-${String(value).padStart(6, "0")}`;
}

export async function createTransfert(
  data: {
    emplacementSourceId: string;
    emplacementDestId: string;
    notes?: string;
    lignes: { produitId: string; quantite: number }[];
  },
  userId: string,
) {
  const transfert = await prisma.$transaction(async (tx) => {
    const numero = await genNumeroTransfert(tx);

    const created = await tx.transfert.create({
      data: {
        numero,
        emplacementSourceId: data.emplacementSourceId,
        emplacementDestId: data.emplacementDestId,
        userId,
        notes: data.notes,
        lignes: {
          create: data.lignes.map((l) => ({
            produitId: l.produitId,
            quantite: l.quantite,
          })),
        },
      },
      include: { lignes: { include: { produit: { select: { nom: true } } } } },
    });

    for (const ligne of data.lignes) {
      // Compare-and-swap : empêche de faire partir plus de stock que disponible en cas de concurrence
      const maj = await tx.stockEmplacement.updateMany({
        where: {
          produitId: ligne.produitId,
          emplacementId: data.emplacementSourceId,
          quantite: { gte: ligne.quantite },
        },
        data: { quantite: { decrement: ligne.quantite } },
      });
      if (maj.count === 0) {
        throw new AppError(
          400,
          `Stock insuffisant pour le produit demandé à l'emplacement source`,
        );
      }

      await tx.mouvementStock.create({
        data: {
          produitId: ligne.produitId,
          emplacementId: data.emplacementSourceId,
          userId,
          type: "TRANSFERT_SORTIE",
          quantite: -ligne.quantite,
          raison: `Transfert ${numero}`,
          referenceType: "TRANSFERT",
          referenceId: created.id,
        },
      });
    }

    return created;
  });

  await createAuditLog({
    userId,
    table: "transferts",
    action: "CREATE",
    entiteId: transfert.id,
    nouveau: { numero: transfert.numero },
  });
  return transfert;
}

export async function listTransferts(params: {
  emplacementId?: string;
  statut?: "EN_TRANSIT" | "RECU" | "ANNULE";
}) {
  const where: any = {};
  if (params.emplacementId) {
    where.OR = [
      { emplacementSourceId: params.emplacementId },
      { emplacementDestId: params.emplacementId },
    ];
  }
  if (params.statut) where.statut = params.statut;

  return prisma.transfert.findMany({
    where,
    include: {
      emplacementSource: { select: { id: true, nom: true, type: true } },
      emplacementDest: { select: { id: true, nom: true, type: true } },
      utilisateur: { select: { nom: true, prenom: true } },
      lignes: {
        include: {
          produit: { select: { nom: true, reference: true, unite: true } },
        },
      },
    },
    orderBy: { dateEnvoi: "desc" },
    take: 100,
  });
}

export async function recevoirTransfert(id: string, userId: string) {
  const transfert = await prisma.transfert.findUnique({
    where: { id },
    include: { lignes: true },
  });
  if (!transfert) throw new AppError(404, "Transfert introuvable");
  if (transfert.statut !== "EN_TRANSIT")
    throw new AppError(
      400,
      "Seul un transfert en transit peut être réceptionné",
    );

  await prisma.$transaction(async (tx) => {
    // Compare-and-swap sur le statut : empêche une double réception concurrente
    const maj = await tx.transfert.updateMany({
      where: { id, statut: "EN_TRANSIT" },
      data: { statut: "RECU", dateReception: new Date() },
    });
    if (maj.count === 0)
      throw new AppError(400, "Ce transfert a déjà été traité entre-temps");

    for (const ligne of transfert.lignes) {
      await tx.stockEmplacement.upsert({
        where: {
          produitId_emplacementId: {
            produitId: ligne.produitId,
            emplacementId: transfert.emplacementDestId,
          },
        },
        update: { quantite: { increment: ligne.quantite } },
        create: {
          produitId: ligne.produitId,
          emplacementId: transfert.emplacementDestId,
          quantite: ligne.quantite,
        },
      });

      await tx.mouvementStock.create({
        data: {
          produitId: ligne.produitId,
          emplacementId: transfert.emplacementDestId,
          userId,
          type: "TRANSFERT_ENTREE",
          quantite: ligne.quantite,
          raison: `Réception transfert ${transfert.numero}`,
          referenceType: "TRANSFERT",
          referenceId: transfert.id,
        },
      });
    }
  });

  await createAuditLog({
    userId,
    table: "transferts",
    action: "RECEPTION",
    entiteId: id,
  });
}

export async function annulerTransfert(id: string, userId: string) {
  const transfert = await prisma.transfert.findUnique({
    where: { id },
    include: { lignes: true },
  });
  if (!transfert) throw new AppError(404, "Transfert introuvable");
  if (transfert.statut !== "EN_TRANSIT")
    throw new AppError(400, "Seul un transfert en transit peut être annulé");

  await prisma.$transaction(async (tx) => {
    const maj = await tx.transfert.updateMany({
      where: { id, statut: "EN_TRANSIT" },
      data: { statut: "ANNULE" },
    });
    if (maj.count === 0)
      throw new AppError(400, "Ce transfert a déjà été traité entre-temps");

    for (const ligne of transfert.lignes) {
      // Restitution du stock à la source
      await tx.stockEmplacement.upsert({
        where: {
          produitId_emplacementId: {
            produitId: ligne.produitId,
            emplacementId: transfert.emplacementSourceId,
          },
        },
        update: { quantite: { increment: ligne.quantite } },
        create: {
          produitId: ligne.produitId,
          emplacementId: transfert.emplacementSourceId,
          quantite: ligne.quantite,
        },
      });

      await tx.mouvementStock.create({
        data: {
          produitId: ligne.produitId,
          emplacementId: transfert.emplacementSourceId,
          userId,
          type: "AJUSTEMENT",
          quantite: ligne.quantite,
          raison: `Annulation transfert ${transfert.numero}`,
          referenceType: "TRANSFERT",
          referenceId: transfert.id,
        },
      });
    }
  });

  await createAuditLog({
    userId,
    table: "transferts",
    action: "ANNULER",
    entiteId: id,
  });
}
