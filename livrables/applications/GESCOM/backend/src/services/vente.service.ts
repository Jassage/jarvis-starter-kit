import prisma from '../utils/prisma';
import { AppError } from '../types';
import { createAuditLog } from '../utils/audit';
import { Prisma } from '@prisma/client';

async function genererNumeroVente(): Promise<string> {
  const count = await prisma.vente.count();
  return `VNT-${String(count + 1).padStart(6, '0')}`;
}

async function resolveCompteId(numero: string): Promise<string | null> {
  const compte = await prisma.compteComptable.findUnique({ where: { numero } });
  return compte?.id ?? null;
}

export async function createVente(
  data: {
    emplacementId: string;
    clientId?: string;
    modePaiement: 'ESPECES' | 'CHEQUE' | 'VIREMENT' | 'CREDIT';
    montantPaye?: number;
    lignes: { produitId: string; quantite: number; prixUnitaire: number }[];
  },
  userId: string
) {
  if (data.modePaiement === 'CREDIT' && !data.clientId) {
    throw new AppError(400, 'Un client est requis pour une vente à crédit');
  }

  const montantTotal = data.lignes.reduce((sum, l) => sum + l.quantite * l.prixUnitaire, 0);
  const montantPaye = data.modePaiement === 'CREDIT' ? (data.montantPaye ?? 0) : montantTotal;

  // Vérification des stocks
  for (const ligne of data.lignes) {
    const stock = await prisma.stockEmplacement.findUnique({
      where: { produitId_emplacementId: { produitId: ligne.produitId, emplacementId: data.emplacementId } },
    });
    if (!stock || stock.quantite < ligne.quantite) {
      const produit = await prisma.produit.findUnique({ where: { id: ligne.produitId } });
      throw new AppError(400, `Stock insuffisant pour "${produit?.nom ?? ligne.produitId}" (disponible : ${stock?.quantite ?? 0})`);
    }
  }

  const numero = await genererNumeroVente();

  // Transaction atomique : vente + lignes + stock + mouvements + comptabilité + soldeDu
  const vente = await prisma.$transaction(async (tx) => {
    const venteCreee = await tx.vente.create({
      data: {
        numero,
        emplacementId: data.emplacementId,
        clientId: data.clientId,
        userId,
        statut: 'VALIDEE',
        modePaiement: data.modePaiement,
        montantTotal: new Prisma.Decimal(montantTotal),
        montantPaye: new Prisma.Decimal(montantPaye),
        dateVente: new Date(),
        lignes: {
          create: data.lignes.map((l) => ({
            produitId: l.produitId,
            quantite: l.quantite,
            prixUnitaire: new Prisma.Decimal(l.prixUnitaire),
            montantLigne: new Prisma.Decimal(l.quantite * l.prixUnitaire),
          })),
        },
      },
    });

    // Décrément stock + mouvements VENTE
    for (const ligne of data.lignes) {
      // Compare-and-swap : le décrément n'est appliqué que si le stock est encore suffisant au moment
      // de la transaction, ce qui empêche une survente en cas de ventes concurrentes sur le même produit.
      const decremente = await tx.stockEmplacement.updateMany({
        where: { produitId: ligne.produitId, emplacementId: data.emplacementId, quantite: { gte: ligne.quantite } },
        data: { quantite: { decrement: ligne.quantite } },
      });
      if (decremente.count === 0) {
        const produit = await tx.produit.findUnique({ where: { id: ligne.produitId } });
        throw new AppError(400, `Stock insuffisant pour "${produit?.nom ?? ligne.produitId}" (vente concurrente probable, réessayez)`);
      }
      await tx.mouvementStock.create({
        data: {
          produitId: ligne.produitId,
          emplacementId: data.emplacementId,
          userId,
          type: 'VENTE',
          quantite: -ligne.quantite,
          raison: `Vente ${numero}`,
          referenceType: 'VENTE',
          referenceId: venteCreee.id,
        },
      });
    }

    // Mise à jour soldeDu client si CREDIT
    if (data.modePaiement === 'CREDIT' && data.clientId) {
      const soldeRestant = montantTotal - montantPaye;
      if (soldeRestant > 0) {
        await tx.client.update({
          where: { id: data.clientId },
          data: { soldeDu: { increment: new Prisma.Decimal(soldeRestant) } },
        });
      }
    }

    // Écriture comptable (fire-and-forget pattern : erreur ne bloque pas la vente)
    try {
      const compteVentesId = await resolveCompteId('701');
      const compteContrepartieId = data.modePaiement === 'CREDIT'
        ? await resolveCompteId('411')
        : await resolveCompteId('571');

      if (compteVentesId && compteContrepartieId) {
        await tx.ecritureComptable.create({
          data: {
            compteDebitId: compteContrepartieId,
            compteCreditId: compteVentesId,
            montant: new Prisma.Decimal(montantTotal),
            libelle: `Vente ${numero}`,
            userId,
            referenceType: 'VENTE',
            referenceId: venteCreee.id,
          },
        });
      }
    } catch {
      await tx.ecritureEchec.create({
        data: {
          compteDebitNumero: data.modePaiement === 'CREDIT' ? '411' : '571',
          compteCreditNumero: '701',
          montant: new Prisma.Decimal(montantTotal),
          libelle: `Vente ${numero}`,
          erreur: 'Compte introuvable',
          referenceType: 'VENTE',
          referenceId: venteCreee.id,
        },
      });
    }

    return venteCreee;
  });

  await createAuditLog({ userId, table: 'ventes', action: 'CREATE', entiteId: vente.id, nouveau: { numero, montantTotal } });
  return vente;
}

export async function listVentes(params: { emplacementId?: string; statut?: string; dateFrom?: string; dateTo?: string }) {
  const where: any = {};
  if (params.emplacementId) where.emplacementId = params.emplacementId;
  if (params.statut) where.statut = params.statut;
  if (params.dateFrom || params.dateTo) {
    where.dateVente = {};
    if (params.dateFrom) where.dateVente.gte = new Date(params.dateFrom);
    if (params.dateTo) where.dateVente.lte = new Date(params.dateTo + 'T23:59:59');
  }

  return prisma.vente.findMany({
    where,
    include: {
      client: { select: { id: true, nom: true, type: true } },
      emplacement: { select: { id: true, nom: true, type: true } },
      utilisateur: { select: { nom: true, prenom: true } },
      lignes: { include: { produit: { select: { nom: true, reference: true, unite: true } } } },
    },
    orderBy: { dateVente: 'desc' },
    take: 100,
  });
}

export async function getVente(id: string) {
  const vente = await prisma.vente.findUnique({
    where: { id },
    include: {
      client: true,
      emplacement: true,
      utilisateur: { select: { nom: true, prenom: true } },
      lignes: { include: { produit: { select: { nom: true, reference: true, unite: true } } } },
    },
  });
  if (!vente) throw new AppError(404, 'Vente introuvable');
  return vente;
}

export async function cancelVente(id: string, userId: string) {
  const vente = await prisma.vente.findUnique({
    where: { id },
    include: { lignes: true },
  });
  if (!vente) throw new AppError(404, 'Vente introuvable');
  if (vente.statut === 'ANNULEE') throw new AppError(400, 'Vente déjà annulée');

  await prisma.$transaction(async (tx) => {
    await tx.vente.update({ where: { id }, data: { statut: 'ANNULEE' } });

    if (vente.statut === 'VALIDEE') {
      // Restitution du stock
      for (const ligne of vente.lignes) {
        await tx.stockEmplacement.update({
          where: { produitId_emplacementId: { produitId: ligne.produitId, emplacementId: vente.emplacementId } },
          data: { quantite: { increment: ligne.quantite } },
        });
        await tx.mouvementStock.create({
          data: {
            produitId: ligne.produitId,
            emplacementId: vente.emplacementId,
            userId,
            type: 'AJUSTEMENT',
            quantite: ligne.quantite,
            raison: `Annulation vente ${vente.numero}`,
            referenceType: 'VENTE',
            referenceId: vente.id,
          },
        });
      }

      // Annulation du soldeDu client si crédit
      if (vente.modePaiement === 'CREDIT' && vente.clientId) {
        const soldeRestant = Number(vente.montantTotal) - Number(vente.montantPaye);
        if (soldeRestant > 0) {
          await tx.client.update({
            where: { id: vente.clientId },
            data: { soldeDu: { decrement: new Prisma.Decimal(soldeRestant) } },
          });
        }
      }
    }
  });

  await createAuditLog({ userId, table: 'ventes', action: 'ANNULEE', entiteId: id });
}
