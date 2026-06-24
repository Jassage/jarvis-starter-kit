import prisma from '../utils/prisma';
import { AppError } from '../types';
import { Devise } from '@prisma/client';
import { createAuditLog } from '../utils/audit';

export async function ouvrirSession(data: {
  agenceId: string;
  userId: string;
  soldeOuverture: number;
  devise?: Devise;
  notes?: string;
}) {
  const { agenceId, userId, soldeOuverture, devise = 'HTG', notes } = data;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const existing = await prisma.sessionCaisse.findFirst({
    where: { agenceId, devise, statut: 'OUVERTE' },
  });
  if (existing) throw new AppError(400, `Une session de caisse ${devise} est déjà ouverte pour cette agence`);

  const session = await prisma.sessionCaisse.create({
    data: {
      agenceId,
      ouvertParId: userId,
      soldeOuverture,
      devise,
      notes,
    },
    include: {
      agence: { select: { nom: true, code: true } },
      ouvertPar: { select: { nom: true, prenom: true } },
    },
  });
  await createAuditLog({ userId, table: 'sessions_caisse', action: 'OUVERTURE', entiteId: session.id, nouveau: { agenceId, soldeOuverture, devise } });
  return session;
}

export async function fermerSession(id: string, userId: string, soldeFermeture: number, notes?: string) {
  const session = await prisma.sessionCaisse.findUnique({ where: { id } });
  if (!session) throw new AppError(404, 'Session introuvable');
  if (session.statut !== 'OUVERTE') throw new AppError(400, 'Session déjà fermée');

  const updated = await prisma.sessionCaisse.update({
    where: { id },
    data: { statut: 'FERMEE', fermeParId: userId, soldeFermeture, notes },
    include: {
      agence: { select: { nom: true, code: true } },
      ouvertPar: { select: { nom: true, prenom: true } },
      fermePar: { select: { nom: true, prenom: true } },
    },
  });
  await createAuditLog({ userId, table: 'sessions_caisse', action: 'FERMETURE', entiteId: id, nouveau: { soldeFermeture, notes } });
  return updated;
}

export async function getSessionActive(agenceId: string, devise: Devise = 'HTG') {
  return prisma.sessionCaisse.findFirst({
    where: { agenceId, devise, statut: 'OUVERTE' },
    include: {
      agence: { select: { nom: true, code: true } },
      ouvertPar: { select: { nom: true, prenom: true } },
      _count: { select: { transactions: true } },
    },
  });
}

export async function getSession(id: string) {
  const session = await prisma.sessionCaisse.findUnique({
    where: { id },
    include: {
      agence: { select: { nom: true, code: true } },
      ouvertPar: { select: { nom: true, prenom: true, role: true } },
      fermePar: { select: { nom: true, prenom: true, role: true } },
      transactions: {
        orderBy: { createdAt: 'asc' },
        include: {
          compteDebit: { select: { numeroCompte: true, client: { select: { nom: true, prenom: true, raisonSociale: true } } } },
          compteCredit: { select: { numeroCompte: true, client: { select: { nom: true, prenom: true, raisonSociale: true } } } },
          creePar: { select: { nom: true, prenom: true } },
        },
      },
    },
  });
  if (!session) throw new AppError(404, 'Session introuvable');
  return session;
}

export async function listSessions(opts: {
  agenceId?: string;
  from?: Date;
  to?: Date;
  page?: number;
  limit?: number;
}) {
  const { agenceId, from, to, page = 1, limit = 30 } = opts;
  const skip = (page - 1) * limit;
  const where: any = {};
  if (agenceId) where.agenceId = agenceId;
  if (from || to) {
    where.date = {};
    if (from) where.date.gte = from;
    if (to) where.date.lte = to;
  }

  const [total, items] = await Promise.all([
    prisma.sessionCaisse.count({ where }),
    prisma.sessionCaisse.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        agence: { select: { nom: true, code: true } },
        ouvertPar: { select: { nom: true, prenom: true } },
        _count: { select: { transactions: true } },
      },
    }),
  ]);

  return { items, total, page, limit, pages: Math.ceil(total / limit) };
}

export async function getArreteCaisse(sessionId: string) {
  const session = await prisma.sessionCaisse.findUnique({
    where: { id: sessionId },
    include: {
      agence: true,
      ouvertPar: { select: { nom: true, prenom: true } },
      fermePar: { select: { nom: true, prenom: true } },
      transactions: {
        where: { statut: 'VALIDEE' },
        orderBy: { createdAt: 'asc' },
        include: {
          compteCredit: { select: { numeroCompte: true, client: { select: { nom: true, prenom: true, raisonSociale: true } } } },
          compteDebit: { select: { numeroCompte: true, client: { select: { nom: true, prenom: true, raisonSociale: true } } } },
        },
      },
    },
  });
  if (!session) throw new AppError(404, 'Session introuvable');

  const stats = session.transactions.reduce(
    (acc, tx) => {
      if (tx.type === 'DEPOT') { acc.totalDepots += Number(tx.montant); acc.nbDepots++; }
      if (tx.type === 'RETRAIT') { acc.totalRetraits += Number(tx.montant); acc.nbRetraits++; }
      if (tx.type === 'REMBOURSEMENT_PRET') { acc.totalRemboursements += Number(tx.montant); acc.nbRemboursements++; }
      if (tx.type === 'DECAISSEMENT_PRET') { acc.totalDecaissements += Number(tx.montant); acc.nbDecaissements++; }
      return acc;
    },
    { totalDepots: 0, totalRetraits: 0, totalRemboursements: 0, totalDecaissements: 0, nbDepots: 0, nbRetraits: 0, nbRemboursements: 0, nbDecaissements: 0 }
  );

  return { session, stats };
}
