import prisma from '../utils/prisma';
import { generateReferenceTransaction } from '../utils/reference';
import { AppError } from '../types';
import { TypeTransaction, Devise } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import { createAuditLog } from '../utils/audit';
import { creerEcritureAuto } from './compta.service';
import { getConfig } from './configuration.service';
import { withRetry } from '../utils/withRetry';
import { preleverFraisVirement } from './frais.service';
import { analyserTransactionAML } from './aml.service';
import { broadcastSSE } from './sse.service';

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

// Dépôt/retrait sont les seuls mouvements qui déplacent du cash physique (une agence ne peut
// débiter/créditer que ses propres comptes, cf. RBAC ci-dessous, donc l'agence du compte = l'agence
// d'exécution). Incrémente le cash de l'agence, sans garde (l'argent est déjà physiquement en main).
async function crediterCaisseAgence(tx: any, agenceId: string, devise: string, montant: number) {
  return tx.caisseAgence.upsert({
    where: { agenceId_devise: { agenceId, devise } },
    update: { solde: { increment: montant } },
    create: { agenceId, devise: devise as any, solde: montant },
  });
}

// Compare-and-swap : rejette si le cash physique de l'agence est insuffisant, indépendamment du
// solde du compte client débité (les deux gardes sont distinctes et coexistent).
async function debiterCaisseAgence(tx: any, agenceId: string, devise: string, montant: number) {
  const caisse = await tx.caisseAgence.upsert({
    where: { agenceId_devise: { agenceId, devise } },
    update: {},
    create: { agenceId, devise: devise as any, solde: 0 },
  });
  const cas = await tx.caisseAgence.updateMany({
    where: { agenceId, devise, solde: { gte: montant } },
    data: { solde: { decrement: montant } },
  });
  if (cas.count === 0) {
    throw new AppError(400, `Cash insuffisant en agence pour ce retrait. Cash disponible : ${Number(caisse.solde)} ${devise}`);
  }
}

// Alerte (pas de blocage : l'argent est déjà en caisse) si le solde dépasse le plafond configuré —
// diffusée après validation du dépôt, réutilise le canal SSE existant (sse.service.ts)
async function verifierPlafondCaisse(agenceId: string, devise: string) {
  const caisse = await prisma.caisseAgence.findUnique({ where: { agenceId_devise: { agenceId, devise: devise as any } } });
  if (caisse?.plafondAlerte && Number(caisse.solde) > Number(caisse.plafondAlerte)) {
    broadcastSSE({
      type: 'PLAFOND_CAISSE_DEPASSE',
      agenceId,
      data: { solde: Number(caisse.solde), plafond: Number(caisse.plafondAlerte), devise },
    });
  }
}

export async function effectuerDepot(data: {
  compteId: string;
  montant: number;
  motif?: string;
  sessionId?: string;
  userId: string;
  agenceId?: string | null;
}) {
  const { compteId, montant, motif, userId, agenceId } = data;
  if (montant <= 0) throw new AppError(400, 'Le montant doit être positif');

  const comptePre = await prisma.compte.findUnique({ where: { id: compteId } });
  if (!comptePre) throw new AppError(404, 'Compte introuvable');
  if (comptePre.statut !== 'ACTIF') throw new AppError(400, 'Compte inactif ou suspendu');
  // Un agent lié à une agence ne peut opérer que sur les comptes de cette agence
  if (agenceId && comptePre.agenceId !== agenceId) throw new AppError(403, 'Ce compte n\'appartient pas à votre agence');

  const sessionId = await resolveSessionId(comptePre.agenceId, comptePre.devise, data.sessionId);
  const agenceExecutionId = agenceId ?? comptePre.agenceId;
  const reference = await generateReferenceTransaction('DEPOT');
  const needsValidation = seuilDepasse(montant, comptePre.devise);

  const result = await withRetry(() => prisma.$transaction(async (tx) => {
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
        agenceExecutionId,
        creeParId: userId,
      },
    });

    if (!needsValidation) {
      // B1: Utiliser increment (relatif) et non une valeur absolue
      await tx.compte.update({
        where: { id: compteId },
        data: { solde: { increment: montant } },
      });
      await crediterCaisseAgence(tx, agenceExecutionId, comptePre.devise, montant);
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
  const eventType = needsValidation ? 'TRANSACTION_EN_ATTENTE' : 'TRANSACTION_VALIDEE';
  broadcastSSE({ type: eventType, agenceId: comptePre.agenceId, data: { id: result.id, type: 'DEPOT', montant, devise: String(comptePre.devise) } });
  if (!needsValidation) {
    analyserTransactionAML({ compteId, clientId: comptePre.clientId, transactionId: result.id, montant, devise: String(comptePre.devise) }).catch(() => {});
    await verifierPlafondCaisse(agenceExecutionId, comptePre.devise);
  }
  return result;
}

export async function effectuerRetrait(data: {
  compteId: string;
  montant: number;
  motif?: string;
  sessionId?: string;
  userId: string;
  agenceId?: string | null;
}) {
  const { compteId, montant, motif, userId, agenceId } = data;
  if (montant <= 0) throw new AppError(400, 'Le montant doit être positif');

  const comptePre = await prisma.compte.findUnique({ where: { id: compteId } });
  if (!comptePre) throw new AppError(404, 'Compte introuvable');
  if (comptePre.statut !== 'ACTIF') throw new AppError(400, 'Compte inactif ou suspendu');
  if (agenceId && comptePre.agenceId !== agenceId) throw new AppError(403, 'Ce compte n\'appartient pas à votre agence');

  // Blocage des retraits sur compte à terme avant la date d'échéance
  if (comptePre.type === 'TERME' && comptePre.dateEcheance && comptePre.dateEcheance > new Date()) {
    const echeance = comptePre.dateEcheance.toLocaleDateString('fr-HT', { year: 'numeric', month: 'long', day: 'numeric' });
    throw new AppError(400, `Compte à terme : retrait impossible avant l'échéance du ${echeance}. Contactez votre conseiller pour un retrait anticipé.`);
  }

  // Vérification du plafond de retrait journalier cumulatif (somme de tous les retraits du jour)
  const plafond = parseFloat(await getConfig('PLAFOND_RETRAIT_JOURNALIER') || '0');
  if (plafond > 0) {
    const debutJour = new Date();
    debutJour.setHours(0, 0, 0, 0);
    const finJour = new Date();
    finJour.setHours(23, 59, 59, 999);
    const totalRetraitsJour = await prisma.transaction.aggregate({
      where: {
        compteDebitId: compteId,
        type: 'RETRAIT',
        statut: { in: ['VALIDEE', 'EN_ATTENTE'] },
        createdAt: { gte: debutJour, lte: finJour },
      },
      _sum: { montant: true },
    });
    const dejaRetire = Number(totalRetraitsJour._sum.montant || 0);
    if (dejaRetire + montant > plafond) {
      throw new AppError(400, `Plafond journalier atteint. Déjà retiré : ${dejaRetire} ${comptePre.devise}, plafond : ${plafond} ${comptePre.devise}`);
    }
  }

  const sessionId = await resolveSessionId(comptePre.agenceId, comptePre.devise, data.sessionId);
  const agenceExecutionId = agenceId ?? comptePre.agenceId;
  const reference = await generateReferenceTransaction('RETRAIT');
  const needsValidation = seuilDepasse(montant, comptePre.devise);
  const soldeMinimum = Number(comptePre.soldeMinimum);

  const retraitResult = await withRetry(() => prisma.$transaction(async (tx) => {
    // Lire le solde courant À L'INTÉRIEUR de la transaction pour snapshot cohérent
    const compteInTx = await tx.compte.findUnique({ where: { id: compteId }, select: { solde: true } });
    const soldeAvant = Number(compteInTx!.solde);
    const soldeApres = soldeAvant - montant;

    if (!needsValidation) {
      // B1: Vérification du solde + décrémentation atomique en une seule requête SQL
      // WHERE solde >= soldeMinimum + montant garantit qu'aucune race condition n'est possible
      const upd = await tx.compte.updateMany({
        where: { id: compteId, solde: { gte: soldeMinimum + montant } },
        data: { solde: { decrement: montant } },
      });
      if (upd.count === 0) {
        const available = soldeAvant - soldeMinimum;
        throw new AppError(400, `Solde insuffisant. Solde disponible : ${available} ${comptePre.devise}`);
      }
      // Garde distincte : le cash physique de l'agence doit aussi être suffisant
      await debiterCaisseAgence(tx, agenceExecutionId, comptePre.devise, montant);
    } else {
      // Transaction en attente : vérifier le solde sans décrémenter
      if (soldeAvant - montant < soldeMinimum) {
        throw new AppError(400, `Solde insuffisant. Solde disponible : ${soldeAvant - soldeMinimum} ${comptePre.devise}`);
      }
    }

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
        agenceExecutionId,
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
  const retraitEventType = needsValidation ? 'TRANSACTION_EN_ATTENTE' : 'TRANSACTION_VALIDEE';
  broadcastSSE({ type: retraitEventType, agenceId: comptePre.agenceId, data: { id: retraitResult.id, type: 'RETRAIT', montant, devise: String(comptePre.devise) } });
  if (!needsValidation) analyserTransactionAML({ compteId, clientId: comptePre.clientId, transactionId: retraitResult.id, montant, devise: String(comptePre.devise) }).catch(() => {});
  return retraitResult;
}

export async function effectuerVirement(data: {
  compteSourceId: string;
  compteDestinationId: string;
  montant: number;
  motif?: string;
  sessionId?: string;
  userId: string;
  agenceId?: string | null;
}) {
  const { compteSourceId, compteDestinationId, montant, motif, userId, agenceId } = data;
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
  // Un agent d'agence ne peut débiter que les comptes de son agence (le compte destination peut être externe)
  if (agenceId && source.agenceId !== agenceId) throw new AppError(403, 'Le compte source n\'appartient pas à votre agence');

  const soldeSourceAvant = Number(source.solde);
  const soldeSourceMin = Number(source.soldeMinimum);
  const refDebit = await generateReferenceTransaction('VIREMENT_DEBIT');
  const needsValidation = seuilDepasse(montant, source.devise);
  const sessionId = await resolveSessionId(source.agenceId, source.devise, data.sessionId);
  const agenceExecutionId = agenceId ?? source.agenceId;

  const virementResult = await withRetry(() => prisma.$transaction(async (tx) => {
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
      await preleverFraisVirement({ compteSourceId, montant, devise: source.devise, userId, tx, soldeMinimum: soldeSourceMin });
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
        agenceExecutionId,
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
        agenceExecutionId,
        creeParId: userId,
      },
    });

    await createAuditLog({ userId, table: 'transactions', action: 'VIREMENT', entiteId: txDebit.id, nouveau: { montant, compteSourceId, compteDestinationId, statut: txDebit.statut } });
    return txDebit;
  }));
  const virEventType = needsValidation ? 'TRANSACTION_EN_ATTENTE' : 'TRANSACTION_VALIDEE';
  broadcastSSE({ type: virEventType, agenceId: source.agenceId, data: { id: virementResult.id, type: 'VIREMENT', montant, devise: String(source.devise), compteSourceId, compteDestinationId } });
  if (!needsValidation) {
    analyserTransactionAML({ compteId: compteSourceId, clientId: source.clientId, transactionId: virementResult.id, montant, devise: String(source.devise), compteDestId: compteDestinationId }).catch(() => {});
  }
  return virementResult;
}

export async function validerTransaction(id: string, userId: string) {
  return withRetry(() => prisma.$transaction(async (p) => {
    // Lire la transaction À L'INTÉRIEUR de la tx pour snapshot cohérent
    const tx = await p.transaction.findUnique({
      where: { id },
      include: { compteDebit: true, compteCredit: true },
    });
    if (!tx) throw new AppError(404, 'Transaction introuvable');

    // Verrou atomique : EN_ATTENTE → VALIDEE en une seule instruction SQL.
    // Si deux superviseurs s'exécutent en parallèle, un seul obtiendra count === 1.
    const guard = await p.transaction.updateMany({
      where: { id, statut: 'EN_ATTENTE' },
      data: { statut: 'VALIDEE', valideParId: userId },
    });
    if (guard.count === 0) throw new AppError(409, 'Transaction déjà traitée');

    const montant = Number(tx.montant);

    if (tx.type === 'DEPOT' && tx.compteCreditId) {
      await p.compte.update({ where: { id: tx.compteCreditId }, data: { solde: { increment: montant } } });
      const agenceExecutionId = tx.agenceExecutionId ?? tx.compteCredit?.agenceId;
      if (agenceExecutionId) await crediterCaisseAgence(p, agenceExecutionId, tx.devise, montant);
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
      const compte = await p.compte.findUnique({ where: { id: tx.compteDebitId }, select: { soldeMinimum: true } });
      const soldeMinimum = Number(compte?.soldeMinimum || 0);
      const result = await p.compte.updateMany({
        where: { id: tx.compteDebitId, solde: { gte: soldeMinimum + montant } },
        data: { solde: { decrement: montant } },
      });
      if (result.count === 0) throw new AppError(400, 'Solde insuffisant pour valider ce retrait');
      const agenceExecutionId = tx.agenceExecutionId ?? tx.compteDebit?.agenceId;
      if (agenceExecutionId) await debiterCaisseAgence(p, agenceExecutionId, tx.devise, montant);
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
      const compteSource = await p.compte.findUnique({ where: { id: tx.compteDebitId }, select: { soldeMinimum: true } });
      const soldeMinimum = Number(compteSource?.soldeMinimum || 0);
      const result = await p.compte.updateMany({
        where: { id: tx.compteDebitId, solde: { gte: soldeMinimum + montant } },
        data: { solde: { decrement: montant } },
      });
      if (result.count === 0) throw new AppError(400, 'Solde insuffisant pour valider ce virement');
      await p.compte.update({ where: { id: tx.compteCreditId }, data: { solde: { increment: montant } } });
      await p.transaction.updateMany({
        where: { reference: `${tx.reference}-CR`, statut: 'EN_ATTENTE' },
        data: { statut: 'VALIDEE', valideParId: userId },
      });
    } else if (tx.type === 'VIREMENT_CREDIT') {
      throw new AppError(400, 'Veuillez valider la transaction de débit correspondante pour traiter ce virement');
    }

    await createAuditLog({ userId, table: 'transactions', action: 'VALIDATION', entiteId: id, nouveau: { statut: 'VALIDEE', valideParId: userId } });
    return tx;
  }));
}

export async function validerTransactionWithSSE(id: string, userId: string) {
  const result = await validerTransaction(id, userId);
  // Récupérer l'agenceId depuis le compte débité ou crédité pour router la notification SSE
  const agenceId = result.compteDebit?.agenceId ?? result.compteCredit?.agenceId ?? null;
  broadcastSSE({ type: 'TRANSACTION_VALIDEE', agenceId, data: { id, type: result.type, montant: Number(result.montant) } });
  if (result.type === 'DEPOT' && (result as any).agenceExecutionId) {
    await verifierPlafondCaisse((result as any).agenceExecutionId, String(result.devise));
  }
  return result;
}

export async function rejeterTransaction(id: string, userId: string, motif?: string) {
  const result = await withRetry(() => prisma.$transaction(async (p) => {
    const tx = await p.transaction.findUnique({ where: { id } });
    if (!tx) throw new AppError(404, 'Transaction introuvable');

    const guard = await p.transaction.updateMany({
      where: { id, statut: 'EN_ATTENTE' },
      data: { statut: 'REJETEE', valideParId: userId, motif: motif || tx.motif },
    });
    if (guard.count === 0) throw new AppError(400, 'Transaction déjà traitée');

    // Rejeter aussi le crédit jumeau pour éviter de laisser un virement en suspens
    if (tx.type === 'VIREMENT_DEBIT') {
      await p.transaction.updateMany({
        where: { reference: `${tx.reference}-CR`, statut: 'EN_ATTENTE' },
        data: { statut: 'REJETEE', valideParId: userId, motif: motif || 'Rejet du débit correspondant' },
      });
    }

    return tx;
  }));

  await createAuditLog({ userId, table: 'transactions', action: 'REJET', entiteId: id, nouveau: { statut: 'REJETEE', motif } });
  broadcastSSE({ type: 'TRANSACTION_REJETEE', data: { id, type: result.type, motif } });
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
