import prisma from '../utils/prisma';
import { generateReferenceTransaction } from '../utils/reference';
import { AppError } from '../types';
import { TypeTransaction, Devise } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import { createAuditLog } from '../utils/audit';

const SEUIL_HTG = parseFloat(process.env.SEUIL_VALIDATION_HTG || '50000');
const SEUIL_USD = parseFloat(process.env.SEUIL_VALIDATION_USD || '500');

function seuilDepasse(montant: number, devise: Devise): boolean {
  return devise === 'HTG' ? montant >= SEUIL_HTG : montant >= SEUIL_USD;
}

export async function effectuerDepot(data: {
  compteId: string;
  montant: number;
  motif?: string;
  sessionId?: string;
  userId: string;
}) {
  const { compteId, montant, motif, sessionId, userId } = data;
  if (montant <= 0) throw new AppError(400, 'Le montant doit être positif');

  const compte = await prisma.compte.findUnique({ where: { id: compteId } });
  if (!compte) throw new AppError(404, 'Compte introuvable');
  if (compte.statut !== 'ACTIF') throw new AppError(400, 'Compte inactif ou suspendu');

  const reference = await generateReferenceTransaction('DEPOT');
  const soldeAvant = Number(compte.solde);
  const soldeApres = soldeAvant + montant;
  const needsValidation = seuilDepasse(montant, compte.devise);

  return prisma.$transaction(async (tx) => {
    const transaction = await tx.transaction.create({
      data: {
        reference,
        type: 'DEPOT',
        montant,
        devise: compte.devise,
        soldeAvant,
        soldeApres,
        motif,
        statut: needsValidation ? 'EN_ATTENTE' : 'VALIDEE',
        compteCreditId: compteId,
        sessionId,
        creeParId: userId,
      },
    });

    if (!needsValidation) {
      await tx.compte.update({
        where: { id: compteId },
        data: { solde: soldeApres },
      });
    }

    await createAuditLog({ userId, table: 'transactions', action: 'DEPOT', entiteId: transaction.id, nouveau: { montant, compteId, statut: transaction.statut } });
    return transaction;
  });
}

export async function effectuerRetrait(data: {
  compteId: string;
  montant: number;
  motif?: string;
  sessionId?: string;
  userId: string;
}) {
  const { compteId, montant, motif, sessionId, userId } = data;
  if (montant <= 0) throw new AppError(400, 'Le montant doit être positif');

  const compte = await prisma.compte.findUnique({ where: { id: compteId } });
  if (!compte) throw new AppError(404, 'Compte introuvable');
  if (compte.statut !== 'ACTIF') throw new AppError(400, 'Compte inactif ou suspendu');

  const soldeAvant = Number(compte.solde);
  const soldeMinimum = Number(compte.soldeMinimum);
  if (soldeAvant - montant < soldeMinimum) {
    throw new AppError(400, `Solde insuffisant. Solde disponible : ${soldeAvant - soldeMinimum} ${compte.devise}`);
  }

  const reference = await generateReferenceTransaction('RETRAIT');
  const soldeApres = soldeAvant - montant;
  const needsValidation = seuilDepasse(montant, compte.devise);

  return prisma.$transaction(async (tx) => {
    const transaction = await tx.transaction.create({
      data: {
        reference,
        type: 'RETRAIT',
        montant,
        devise: compte.devise,
        soldeAvant,
        soldeApres,
        motif,
        statut: needsValidation ? 'EN_ATTENTE' : 'VALIDEE',
        compteDebitId: compteId,
        sessionId,
        creeParId: userId,
      },
    });

    if (!needsValidation) {
      await tx.compte.update({
        where: { id: compteId },
        data: { solde: soldeApres },
      });
    }

    await createAuditLog({ userId, table: 'transactions', action: 'RETRAIT', entiteId: transaction.id, nouveau: { montant, compteId, statut: transaction.statut } });
    return transaction;
  });
}

export async function effectuerVirement(data: {
  compteSourceId: string;
  compteDestinationId: string;
  montant: number;
  motif?: string;
  sessionId?: string;
  userId: string;
}) {
  const { compteSourceId, compteDestinationId, montant, motif, sessionId, userId } = data;
  if (montant <= 0) throw new AppError(400, 'Le montant doit être positif');
  if (compteSourceId === compteDestinationId) throw new AppError(400, 'Les comptes source et destination doivent être différents');

  const [source, destination] = await Promise.all([
    prisma.compte.findUnique({ where: { id: compteSourceId } }),
    prisma.compte.findUnique({ where: { id: compteDestinationId } }),
  ]);

  if (!source) throw new AppError(404, 'Compte source introuvable');
  if (!destination) throw new AppError(404, 'Compte destination introuvable');
  if (source.statut !== 'ACTIF') throw new AppError(400, 'Compte source inactif');
  if (destination.statut !== 'ACTIF') throw new AppError(400, 'Compte destination inactif');
  if (source.devise !== destination.devise) throw new AppError(400, 'Virement entre devises différentes non supporté');

  const soldeSourceAvant = Number(source.solde);
  const soldeSourceMin = Number(source.soldeMinimum);
  if (soldeSourceAvant - montant < soldeSourceMin) {
    throw new AppError(400, `Solde insuffisant sur le compte source`);
  }

  const refDebit = await generateReferenceTransaction('VIREMENT_DEBIT');
  const refCredit = refDebit.replace('VIR', 'VIR');
  const needsValidation = seuilDepasse(montant, source.devise);

  return prisma.$transaction(async (tx) => {
    const soldeDestAvant = Number(destination.solde);

    const txDebit = await tx.transaction.create({
      data: {
        reference: refDebit,
        type: 'VIREMENT_DEBIT',
        montant,
        devise: source.devise,
        soldeAvant: soldeSourceAvant,
        soldeApres: soldeSourceAvant - montant,
        motif,
        statut: needsValidation ? 'EN_ATTENTE' : 'VALIDEE',
        compteDebitId: compteSourceId,
        compteCreditId: compteDestinationId,
        sessionId,
        creeParId: userId,
      },
    });

    await tx.transaction.create({
      data: {
        reference: `${refDebit}-CR`,
        type: 'VIREMENT_CREDIT',
        montant,
        devise: source.devise,
        soldeAvant: soldeDestAvant,
        soldeApres: soldeDestAvant + montant,
        motif,
        statut: needsValidation ? 'EN_ATTENTE' : 'VALIDEE',
        compteDebitId: compteSourceId,
        compteCreditId: compteDestinationId,
        sessionId,
        creeParId: userId,
      },
    });

    if (!needsValidation) {
      await tx.compte.update({ where: { id: compteSourceId }, data: { solde: soldeSourceAvant - montant } });
      await tx.compte.update({ where: { id: compteDestinationId }, data: { solde: soldeDestAvant + montant } });
    }

    await createAuditLog({ userId, table: 'transactions', action: 'VIREMENT', entiteId: txDebit.id, nouveau: { montant, compteSourceId, compteDestinationId, statut: txDebit.statut } });
    return txDebit;
  });
}

export async function validerTransaction(id: string, userId: string) {
  const tx = await prisma.transaction.findUnique({
    where: { id },
    include: { compteDebit: true, compteCredit: true },
  });
  if (!tx) throw new AppError(404, 'Transaction introuvable');
  if (tx.statut !== 'EN_ATTENTE') throw new AppError(400, 'Transaction déjà traitée');

  return prisma.$transaction(async (p) => {
    const updated = await p.transaction.update({
      where: { id },
      data: { statut: 'VALIDEE', valideParId: userId },
    });

    const montant = Number(tx.montant);

    if (tx.type === 'DEPOT' && tx.compteCreditId) {
      await p.compte.update({ where: { id: tx.compteCreditId }, data: { solde: { increment: montant } } });
    } else if (tx.type === 'RETRAIT' && tx.compteDebitId) {
      await p.compte.update({ where: { id: tx.compteDebitId }, data: { solde: { decrement: montant } } });
    } else if ((tx.type === 'VIREMENT_DEBIT' || tx.type === 'VIREMENT_CREDIT') && tx.compteDebitId && tx.compteCreditId) {
      await p.compte.update({ where: { id: tx.compteDebitId }, data: { solde: { decrement: montant } } });
      await p.compte.update({ where: { id: tx.compteCreditId }, data: { solde: { increment: montant } } });
      await p.transaction.updateMany({
        where: { reference: { startsWith: tx.reference.replace('-CR', '') }, statut: 'EN_ATTENTE' },
        data: { statut: 'VALIDEE', valideParId: userId },
      });
    }

    await createAuditLog({ userId, table: 'transactions', action: 'VALIDATION', entiteId: id, nouveau: { statut: 'VALIDEE', valideParId: userId } });
    return updated;
  });
}

export async function rejeterTransaction(id: string, userId: string, motif?: string) {
  const tx = await prisma.transaction.findUnique({ where: { id } });
  if (!tx) throw new AppError(404, 'Transaction introuvable');
  if (tx.statut !== 'EN_ATTENTE') throw new AppError(400, 'Transaction déjà traitée');

  const result = await prisma.transaction.update({
    where: { id },
    data: { statut: 'REJETEE', valideParId: userId, motif: motif || tx.motif },
  });
  await createAuditLog({ userId, table: 'transactions', action: 'REJET', entiteId: id, nouveau: { statut: 'REJETEE', motif } });
  return result;
}

export async function listTransactions(opts: {
  compteId?: string;
  type?: TypeTransaction;
  statut?: string;
  sessionId?: string;
  from?: Date;
  to?: Date;
  page?: number;
  limit?: number;
}) {
  const { compteId, type, statut, sessionId, from, to, page = 1, limit = 30 } = opts;
  const skip = (page - 1) * limit;

  const where: any = {};
  if (compteId) where.OR = [{ compteDebitId: compteId }, { compteCreditId: compteId }];
  if (type) where.type = type;
  if (statut) where.statut = statut;
  if (sessionId) where.sessionId = sessionId;
  if (from || to) {
    where.createdAt = {};
    if (from) where.createdAt.gte = from;
    if (to) where.createdAt.lte = to;
  }

  const [total, items] = await Promise.all([
    prisma.transaction.count({ where }),
    prisma.transaction.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        creePar: { select: { nom: true, prenom: true } },
        validePar: { select: { nom: true, prenom: true } },
        compteDebit: { select: { numeroCompte: true, client: { select: { nom: true, prenom: true, raisonSociale: true } } } },
        compteCredit: { select: { numeroCompte: true, client: { select: { nom: true, prenom: true, raisonSociale: true } } } },
      },
    }),
  ]);

  return { items, total, page, limit, pages: Math.ceil(total / limit) };
}

export async function getTransaction(id: string) {
  const tx = await prisma.transaction.findUnique({
    where: { id },
    include: {
      creePar: { select: { nom: true, prenom: true, role: true } },
      validePar: { select: { nom: true, prenom: true, role: true } },
      compteDebit: { include: { client: { select: { nom: true, prenom: true, raisonSociale: true, type: true } } } },
      compteCredit: { include: { client: { select: { nom: true, prenom: true, raisonSociale: true, type: true } } } },
      session: { select: { date: true, agence: { select: { nom: true } } } },
    },
  });
  if (!tx) throw new AppError(404, 'Transaction introuvable');
  return tx;
}
