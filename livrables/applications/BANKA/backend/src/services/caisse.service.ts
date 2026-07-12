import prisma from '../utils/prisma';
import { AppError } from '../types';
import { Devise } from '@prisma/client';
import { createAuditLog } from '../utils/audit';

// Lit le solde de caisse persistant de l'agence (source de vérité indépendante des sessions),
// en créant la ligne à 0 si l'agence n'a encore jamais eu de caisse dans cette devise
async function getOrCreateCaisseAgence(agenceId: string, devise: Devise) {
  return prisma.caisseAgence.upsert({
    where: { agenceId_devise: { agenceId, devise } },
    update: {},
    create: { agenceId, devise, solde: 0 },
  });
}

export async function ouvrirSession(data: {
  agenceId: string;
  userId: string;
  devise?: Devise;
  notes?: string;
  agentAgenceId?: string | null;
}) {
  const { agenceId, userId, devise = 'HTG', notes, agentAgenceId } = data;

  // Un caissier lié à une agence ne peut ouvrir une session que pour sa propre agence
  if (agentAgenceId && agentAgenceId !== agenceId) throw new AppError(403, 'Vous ne pouvez ouvrir une session de caisse que pour votre propre agence');

  const existing = await prisma.sessionCaisse.findFirst({
    where: { agenceId, devise, statut: 'OUVERTE' },
  });
  if (existing) throw new AppError(400, `Une session de caisse ${devise} est déjà ouverte pour cette agence`);

  // Le solde d'ouverture n'est plus saisi librement : il reprend le solde de caisse persistant de
  // l'agence, mis à jour par la fermeture de la veille (ou les transferts de trésorerie entre-temps)
  const caisseAgence = await getOrCreateCaisseAgence(agenceId, devise);
  const soldeOuverture = Number(caisseAgence.solde);

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

export async function fermerSession(id: string, userId: string, soldeFermeture: number, notes?: string, agentAgenceId?: string | null, justificationEcart?: string) {
  const session = await prisma.sessionCaisse.findUnique({ where: { id } });
  if (!session) throw new AppError(404, 'Session introuvable');
  // Un caissier lié à une agence ne peut fermer que les sessions de sa propre agence
  if (agentAgenceId && session.agenceId !== agentAgenceId) throw new AppError(403, 'Cette session n\'appartient pas à votre agence');
  if (session.statut !== 'OUVERTE') throw new AppError(400, 'Session déjà fermée');

  // Bloquer la fermeture tant que des transactions en attente de validation sont rattachées à cette session
  const txEnAttente = await prisma.transaction.count({ where: { sessionId: id, statut: 'EN_ATTENTE' } });
  if (txEnAttente > 0) {
    throw new AppError(400, `Impossible de fermer la caisse : ${txEnAttente} transaction(s) en attente de validation. Validez ou rejetez-les d'abord.`);
  }

  // Solde théorique = solde de caisse persistant actuel de l'agence. Il est déjà à jour en temps
  // réel (dépôts/retraits validés ET transferts de trésorerie envoyés/reçus pendant la session,
  // cf. transaction.service.ts et tresorerie.service.ts) — recalculer séparément à partir des seules
  // transactions DEPOT/RETRAIT de la session ignorerait les transferts de trésorerie survenus
  // entre-temps et produirait un écart artificiel.
  const caisseActuelle = await getOrCreateCaisseAgence(session.agenceId, session.devise);
  const soldeTheorique = Number(caisseActuelle.solde);
  const ecartConstate = Math.round((soldeFermeture - soldeTheorique) * 100) / 100;

  const [updated] = await prisma.$transaction([
    prisma.sessionCaisse.update({
      where: { id },
      data: { statut: 'FERMEE', fermeParId: userId, soldeFermeture, notes, ecartConstate, justificationEcart },
      include: {
        agence: { select: { nom: true, code: true } },
        ouvertPar: { select: { nom: true, prenom: true } },
        fermePar: { select: { nom: true, prenom: true } },
      },
    }),
    // Le comptage physique devient la nouvelle vérité du cash de l'agence, écart tracé ci-dessus
    // pour investigation plutôt que silencieusement absorbé
    prisma.caisseAgence.upsert({
      where: { agenceId_devise: { agenceId: session.agenceId, devise: session.devise } },
      update: { solde: soldeFermeture },
      create: { agenceId: session.agenceId, devise: session.devise, solde: soldeFermeture },
    }),
  ]);
  await createAuditLog({ userId, table: 'sessions_caisse', action: 'FERMETURE', entiteId: id, nouveau: { soldeFermeture, ecartConstate, notes } });
  return updated;
}

// Le solde de caisse persistant courant de l'agence — reflète en direct chaque dépôt/retrait déjà
// validé (voir transaction.service.ts::crediterCaisseAgence/debiterCaisseAgence), pas seulement au
// moment de la fermeture. Utilisé comme "solde théorique" affiché pendant une session ouverte.
export async function getCaisseActuelle(agenceId: string, devise: Devise = 'HTG') {
  return getOrCreateCaisseAgence(agenceId, devise);
}

export async function getSessionActive(agenceId: string, devise: Devise = 'HTG') {
  const [session, caisseActuelle] = await Promise.all([
    prisma.sessionCaisse.findFirst({
      where: { agenceId, devise, statut: 'OUVERTE' },
      include: {
        agence: { select: { nom: true, code: true } },
        ouvertPar: { select: { nom: true, prenom: true } },
        transactions: {
          orderBy: { createdAt: 'asc' },
          include: {
            compteDebit:  { select: { numeroCompte: true, client: { select: { nom: true, prenom: true, raisonSociale: true } } } },
            compteCredit: { select: { numeroCompte: true, client: { select: { nom: true, prenom: true, raisonSociale: true } } } },
            creePar:      { select: { nom: true, prenom: true } },
          },
        },
      },
    }),
    getOrCreateCaisseAgence(agenceId, devise),
  ]);
  return session ? { ...session, caisseActuelle } : null;
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
