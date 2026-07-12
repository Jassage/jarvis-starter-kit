import prisma from '../utils/prisma';
import { AppError } from '../types';
import { Devise } from '@prisma/client';
import { createAuditLog } from '../utils/audit';
import { generateReferenceTransaction } from '../utils/reference';

// Réapprovisionnement de caisse entre agences (ou vers/depuis le siège, agenceId = null) — mouvement
// de trésorerie interne, distinct d'un virement client : aucune écriture comptable classique (le
// plan comptable BANKA est consolidé au niveau banque, un seul compte 5700 Caisse). Le siège n'a
// aucun solde/plafond suivi dans cette tranche : c'est une réserve non plafonnée.

export async function listTransferts(opts: { agenceId?: string; statut?: string; page?: number; limit?: number }) {
  const { agenceId, statut, page = 1, limit = 30 } = opts;
  const skip = (page - 1) * limit;
  const where: any = {};
  if (agenceId) where.OR = [{ agenceSourceId: agenceId }, { agenceDestId: agenceId }];
  if (statut) where.statut = statut;

  const [total, items] = await Promise.all([
    prisma.transfertTresorerie.count({ where }),
    prisma.transfertTresorerie.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        agenceSource: { select: { nom: true, code: true } },
        agenceDest: { select: { nom: true, code: true } },
        creePar: { select: { nom: true, prenom: true } },
        recuPar: { select: { nom: true, prenom: true } },
      },
    }),
  ]);
  return { items, total, page, limit, pages: Math.ceil(total / limit) };
}

export async function getTransfert(id: string) {
  const transfert = await prisma.transfertTresorerie.findUnique({
    where: { id },
    include: {
      agenceSource: { select: { nom: true, code: true } },
      agenceDest: { select: { nom: true, code: true } },
      creePar: { select: { nom: true, prenom: true } },
      recuPar: { select: { nom: true, prenom: true } },
    },
  });
  if (!transfert) throw new AppError(404, 'Transfert introuvable');
  return transfert;
}

export async function envoyerTransfert(data: {
  agenceSourceId?: string | null;
  agenceDestId?: string | null;
  devise: Devise;
  montant: number;
  notes?: string;
  userId: string;
  agentAgenceId?: string | null;
}) {
  const { agenceSourceId, agenceDestId, devise, montant, notes, userId, agentAgenceId } = data;
  if (montant <= 0) throw new AppError(400, 'Le montant doit être positif');
  if (!agenceSourceId && !agenceDestId) throw new AppError(400, 'Source et destination ne peuvent pas être toutes les deux le siège');
  if (agenceSourceId && agenceSourceId === agenceDestId) throw new AppError(400, 'Source et destination doivent être différentes');
  // Un superviseur lié à une agence ne peut initier un transfert que s'il implique sa propre agence
  // (transfert vers/depuis le siège autorisé, mais pas un mouvement entre deux AUTRES agences)
  if (agentAgenceId && agenceSourceId !== agentAgenceId && agenceDestId !== agentAgenceId) {
    throw new AppError(403, 'Ce transfert doit impliquer votre propre agence');
  }

  const reference = await generateReferenceTransaction('TRANSFERT_TRESORERIE');

  const transfert = await prisma.$transaction(async (tx) => {
    if (agenceSourceId) {
      // Le siège n'a pas de solde suivi : garde uniquement quand la source est une vraie agence
      const cas = await tx.caisseAgence.updateMany({
        where: { agenceId: agenceSourceId, devise, solde: { gte: montant } },
        data: { solde: { decrement: montant } },
      });
      if (cas.count === 0) throw new AppError(400, 'Cash insuffisant dans la caisse de l\'agence source');
    }

    return tx.transfertTresorerie.create({
      data: { reference, agenceSourceId, agenceDestId, devise, montant, notes, statut: 'ENVOYE', creeParId: userId },
      include: {
        agenceSource: { select: { nom: true, code: true } },
        agenceDest: { select: { nom: true, code: true } },
      },
    });
  });

  await createAuditLog({ userId, table: 'transferts_tresorerie', action: 'ENVOI', entiteId: transfert.id, nouveau: { agenceSourceId, agenceDestId, devise, montant } });
  return transfert;
}

export async function confirmerReception(id: string, userId: string, agentAgenceId?: string | null) {
  const transfert = await prisma.transfertTresorerie.findUnique({ where: { id } });
  if (!transfert) throw new AppError(404, 'Transfert introuvable');
  // Seule l'agence destinataire (ou le siège) peut confirmer la réception de son propre transfert
  if (agentAgenceId && transfert.agenceDestId !== agentAgenceId) {
    throw new AppError(403, 'Seule l\'agence destinataire peut confirmer la réception de ce transfert');
  }

  const updated = await prisma.$transaction(async (tx) => {
    // Verrou logique : seul un transfert ENVOYE peut être confirmé — empêche une double réception
    const cas = await tx.transfertTresorerie.updateMany({
      where: { id, statut: 'ENVOYE' },
      data: { statut: 'RECU', recuParId: userId, recuAt: new Date() },
    });
    if (cas.count === 0) throw new AppError(409, 'Ce transfert a déjà été traité');

    if (transfert.agenceDestId) {
      await tx.caisseAgence.upsert({
        where: { agenceId_devise: { agenceId: transfert.agenceDestId, devise: transfert.devise } },
        update: { solde: { increment: Number(transfert.montant) } },
        create: { agenceId: transfert.agenceDestId, devise: transfert.devise, solde: transfert.montant },
      });
    }

    return tx.transfertTresorerie.findUniqueOrThrow({
      where: { id },
      include: {
        agenceSource: { select: { nom: true, code: true } },
        agenceDest: { select: { nom: true, code: true } },
      },
    });
  });

  await createAuditLog({ userId, table: 'transferts_tresorerie', action: 'RECEPTION', entiteId: id, nouveau: { statut: 'RECU' } });
  return updated;
}

export async function annulerTransfert(id: string, userId: string) {
  const transfert = await prisma.transfertTresorerie.findUnique({ where: { id } });
  if (!transfert) throw new AppError(404, 'Transfert introuvable');

  const updated = await prisma.$transaction(async (tx) => {
    // Verrou logique : uniquement si pas encore reçu — restitue le cash à la source
    const cas = await tx.transfertTresorerie.updateMany({
      where: { id, statut: 'ENVOYE' },
      data: { statut: 'ANNULE' },
    });
    if (cas.count === 0) throw new AppError(409, 'Seul un transfert non encore reçu peut être annulé');

    if (transfert.agenceSourceId) {
      await tx.caisseAgence.upsert({
        where: { agenceId_devise: { agenceId: transfert.agenceSourceId, devise: transfert.devise } },
        update: { solde: { increment: Number(transfert.montant) } },
        create: { agenceId: transfert.agenceSourceId, devise: transfert.devise, solde: transfert.montant },
      });
    }

    return tx.transfertTresorerie.findUniqueOrThrow({ where: { id } });
  });

  await createAuditLog({ userId, table: 'transferts_tresorerie', action: 'ANNULATION', entiteId: id });
  return updated;
}

export async function getCaisseAgence(agenceId: string) {
  return prisma.caisseAgence.findMany({ where: { agenceId } });
}
