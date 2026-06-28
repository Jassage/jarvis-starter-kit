import prisma from '../utils/prisma';
import { generateReferenceTransaction } from '../utils/reference';
import { AppError } from '../types';
import { TypeTransaction, Devise } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import { createAuditLog } from '../utils/audit';
import { creerEcritureAuto } from './compta.service';
import { getConfig } from './configuration.service';
import { withRetry } from '../utils/withRetry';

const SEUIL_HTG = parseFloat(process.env.SEUIL_VALIDATION_HTG || '50000');
const SEUIL_USD = parseFloat(process.env.SEUIL_VALIDATION_USD || '500');

function seuilDepasse(montant: number, devise: Devise): boolean {
  return devise === 'HTG' ? montant >= SEUIL_HTG : montant >= SEUIL_USD;
}

async function resolveSessionId(agenceId: string, devise: string, providedSessionId?: string): Promise<string | undefined> {
  if (providedSessionId) return providedSessionId;
  const session = await prisma.sessionCaisse.findFirst({
    where: { agenceId, devise: devise as any, statut: 'OUVERTE' },
    select: { id: true },
  });
  return session?.id;
}

export async function effectuerDepot(data: {
  compteId: string;
  montant: number;
  motif?: string;
  sessionId?: string;
  userId: string;
}) {
  const { compteId, montant, motif, userId } = data;
  if (montant <= 0) throw new AppError(400, 'Le montant doit être positif');

  const comptePre = await prisma.compte.findUnique({ where: { id: compteId } });
  if (!comptePre) throw new AppError(404, 'Compte introuvable');
  if (comptePre.statut !== 'ACTIF') throw new AppError(400, 'Compte inactif ou suspendu');

  const sessionId = await resolveSessionId(comptePre.agenceId, comptePre.devise, data.sessionId);
  const reference = await generateReferenceTransaction('DEPOT');
  const needsValidation = seuilDepasse(montant, comptePre.devise);

  return withRetry(() => prisma.$transaction(async (tx) => {
    // B1: Lire le solde À L'INTÉRIEUR de la transaction pour snapshot cohérent
    const compteInTx = await tx.compte.findUnique({ where: { id: compteId }, select: { solde: true } });
    const soldeAvant = Number(compteInTx!.solde);
    const soldeApres = soldeAvant + montant;

    const transaction = await tx.transaction.create({
      data: {
        reference,
        type: 'DEPOT',
        montant,
        devise: comptePre.devise,
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
      // B1: Utiliser increment (relatif) et non une valeur absolue
      await tx.compte.update({
        where: { id: compteId },
        data: { solde: { increment: montant } },
      });
      await creerEcritureAuto(tx, {
        debitNumero:  '5700',
        creditNumero: '2600',
        montant,
        libelle: `Dépôt ${reference}${motif ? ' - ' + motif : ''}`,
        date: new Date(),
        userId,
        transactionId: transaction.id,
      });
    }

    await createAuditLog({ userId, table: 'transactions', action: 'DEPOT', entiteId: transaction.id, nouveau: { montant, compteId, statut: transaction.statut } });
    return transaction;
  }));
}

export async function effectuerRetrait(data: {
  compteId: string;
  montant: number;
  motif?: string;
  sessionId?: string;
  userId: string;
}) {
  const { compteId, montant, motif, userId } = data;
  if (montant <= 0) throw new AppError(400, 'Le montant doit être positif');

  const comptePre = await prisma.compte.findUnique({ where: { id: compteId } });
  if (!comptePre) throw new AppError(404, 'Compte introuvable');
  if (comptePre.statut !== 'ACTIF') throw new AppError(400, 'Compte inactif ou suspendu');

  // B6: Vérification du plafond de retrait journalier depuis la configuration
  const plafond = parseFloat(await getConfig('PLAFOND_RETRAIT_JOURNALIER') || '0');
  if (plafond > 0 && montant > plafond) {
    throw new AppError(400, `Ce retrait (${montant} ${comptePre.devise}) dépasse le plafond journalier autorisé (${plafond} ${comptePre.devise})`);
  }

  const sessionId = await resolveSessionId(comptePre.agenceId, comptePre.devise, data.sessionId);
  const reference = await generateReferenceTransaction('RETRAIT');
  const needsValidation = seuilDepasse(montant, comptePre.devise);
  const soldeMinimum = Number(comptePre.soldeMinimum);

  return withRetry(() => prisma.$transaction(async (tx) => {
    if (!needsValidation) {
      // B1: Vérification du solde + décrémentation atomique en une seule requête SQL
      // WHERE solde >= soldeMinimum + montant garantit qu'aucune race condition n'est possible
      const result = await tx.compte.updateMany({
        where: { id: compteId, solde: { gte: soldeMinimum + montant } },
        data: { solde: { decrement: montant } },
      });
      if (result.count === 0) {
        const current = await tx.compte.findUnique({ where: { id: compteId }, select: { solde: true } });
        const available = Number(current!.solde) - soldeMinimum;
        throw new AppError(400, `Solde insuffisant. Solde disponible : ${available} ${comptePre.devise}`);
      }
    } else {
      // Transaction en attente : vérifier le solde sans décrémenter
      const current = await tx.compte.findUnique({ where: { id: compteId }, select: { solde: true } });
      if (Number(current!.solde) - montant < soldeMinimum) {
        throw new AppError(400, `Solde insuffisant. Solde disponible : ${Number(current!.solde) - soldeMinimum} ${comptePre.devise}`);
      }
    }

    const soldeAvant = Number(comptePre.solde);
    const soldeApres = soldeAvant - montant;

    const transaction = await tx.transaction.create({
      data: {
        reference,
        type: 'RETRAIT',
        montant,
        devise: comptePre.devise,
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
      await creerEcritureAuto(tx, {
        debitNumero:  '2600',
        creditNumero: '5700',
        montant,
        libelle: `Retrait ${reference}${motif ? ' - ' + motif : ''}`,
        date: new Date(),
        userId,
        transactionId: transaction.id,
      });
    }

    await createAuditLog({ userId, table: 'transactions', action: 'RETRAIT', entiteId: transaction.id, nouveau: { montant, compteId, statut: transaction.statut } });
    return transaction;
  }));
}

export async function effectuerVirement(data: {
  compteSourceId: string;
  compteDestinationId: string;
  montant: number;
  motif?: string;
  sessionId?: string;
  userId: string;
}) {
  const { compteSourceId, compteDestinationId, montant, motif, userId } = data;
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
  const refDebit = await generateReferenceTransaction('VIREMENT_DEBIT');
  const needsValidation = seuilDepasse(montant, source.devise);
  const sessionId = await resolveSessionId(source.agenceId, source.devise, data.sessionId);

  return withRetry(() => prisma.$transaction(async (tx) => {
    // B1: Lire les soldes À L'INTÉRIEUR de la transaction pour snapshot cohérent
    const [sourceInTx, destInTx] = await Promise.all([
      tx.compte.findUnique({ where: { id: compteSourceId }, select: { solde: true, soldeMinimum: true } }),
      tx.compte.findUnique({ where: { id: compteDestinationId }, select: { solde: true } }),
    ]);
    const soldeSourceAvant = Number(sourceInTx!.solde);
    const soldeSourceMin = Number(sourceInTx!.soldeMinimum);
    const soldeDestAvant = Number(destInTx!.solde);

    if (!needsValidation) {
      // B1: Vérification du solde + décrémentation atomique en une seule requête SQL
      const result = await tx.compte.updateMany({
        where: { id: compteSourceId, solde: { gte: soldeSourceMin + montant } },
        data: { solde: { decrement: montant } },
      });
      if (result.count === 0) {
        const available = soldeSourceAvant - soldeSourceMin;
        throw new AppError(400, `Solde insuffisant sur le compte source. Disponible : ${available} ${source.devise}`);
      }
      await tx.compte.update({ where: { id: compteDestinationId }, data: { solde: { increment: montant } } });
    } else {
      // Transaction en attente : vérifier le solde sans modifier
      if (soldeSourceAvant - montant < soldeSourceMin) {
        throw new AppError(400, `Solde insuffisant sur le compte source`);
      }
    }

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

    await createAuditLog({ userId, table: 'transactions', action: 'VIREMENT', entiteId: txDebit.id, nouveau: { montant, compteSourceId, compteDestinationId, statut: txDebit.statut } });
    return txDebit;
  }));
}

export async function validerTransaction(id: string, userId: string) {
  const tx = await prisma.transaction.findUnique({
    where: { id },
    include: { compteDebit: true, compteCredit: true },
  });
  if (!tx) throw new AppError(404, 'Transaction introuvable');
  if (tx.statut !== 'EN_ATTENTE') throw new AppError(400, 'Transaction déjà traitée');

  return withRetry(() => prisma.$transaction(async (p) => {
    const updated = await p.transaction.update({
      where: { id },
      data: { statut: 'VALIDEE', valideParId: userId },
    });

    const montant = Number(tx.montant);

    if (tx.type === 'DEPOT' && tx.compteCreditId) {
      await p.compte.update({ where: { id: tx.compteCreditId }, data: { solde: { increment: montant } } });
      await creerEcritureAuto(p, {
        debitNumero:  '5700',
        creditNumero: '2600',
        montant,
        libelle: `Dépôt validé ${tx.reference}`,
        date: new Date(),
        userId,
        transactionId: id,
      });
    } else if (tx.type === 'RETRAIT' && tx.compteDebitId) {
      // B1: Vérification atomique du solde au moment de la validation
      const compte = await p.compte.findUnique({ where: { id: tx.compteDebitId }, select: { soldeMinimum: true } });
      const soldeMinimum = Number(compte?.soldeMinimum || 0);
      const result = await p.compte.updateMany({
        where: { id: tx.compteDebitId, solde: { gte: soldeMinimum + montant } },
        data: { solde: { decrement: montant } },
      });
      if (result.count === 0) {
        throw new AppError(400, 'Solde insuffisant pour valider ce retrait');
      }
      await creerEcritureAuto(p, {
        debitNumero:  '2600',
        creditNumero: '5700',
        montant,
        libelle: `Retrait validé ${tx.reference}`,
        date: new Date(),
        userId,
        transactionId: id,
      });
    } else if (tx.type === 'VIREMENT_DEBIT' && tx.compteDebitId && tx.compteCreditId) {
      // B4: Seul le VIREMENT_DEBIT modifie les soldes et valide la transaction jumelle
      // Atomic check + decrement sur le compte source
      const compteSource = await p.compte.findUnique({ where: { id: tx.compteDebitId }, select: { soldeMinimum: true } });
      const soldeMinimum = Number(compteSource?.soldeMinimum || 0);
      const result = await p.compte.updateMany({
        where: { id: tx.compteDebitId, solde: { gte: soldeMinimum + montant } },
        data: { solde: { decrement: montant } },
      });
      if (result.count === 0) {
        throw new AppError(400, 'Solde insuffisant pour valider ce virement');
      }
      await p.compte.update({ where: { id: tx.compteCreditId }, data: { solde: { increment: montant } } });
      // Auto-valider la transaction crédit jumelle (elle ne modifie pas les soldes elle-même)
      await p.transaction.updateMany({
        where: { reference: `${tx.reference}-CR`, statut: 'EN_ATTENTE' },
        data: { statut: 'VALIDEE', valideParId: userId },
      });
    } else if (tx.type === 'VIREMENT_CREDIT') {
      // B4: Le CREDIT seul ne doit pas modifier les soldes — valider le VIREMENT_DEBIT correspondant
      throw new AppError(400, 'Veuillez valider la transaction de débit correspondante pour traiter ce virement');
    }

    await createAuditLog({ userId, table: 'transactions', action: 'VALIDATION', entiteId: id, nouveau: { statut: 'VALIDEE', valideParId: userId } });
    return updated;
  }));
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
