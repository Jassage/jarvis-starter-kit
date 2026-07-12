import prisma from '../utils/prisma';
import { generateNumeroCompte, generateReferenceTransaction } from '../utils/reference';
import { AppError } from '../types';
import { TypeCompte, Devise, StatutCompte } from '@prisma/client';
import { createAuditLog } from '../utils/audit';
import { getConfig } from './configuration.service';
import { creerEcritureAuto } from './compta.service';

export async function listComptes(opts: {
  clientId?: string;
  agenceId?: string;
  type?: TypeCompte;
  statut?: StatutCompte;
  devise?: Devise;
  search?: string;
  page?: number;
  limit?: number;
}) {
  const { clientId, agenceId, type, statut, devise, search, page = 1, limit = 20 } = opts;
  const skip = (page - 1) * limit;
  const where: any = {};
  if (clientId) where.clientId = clientId;
  if (agenceId) where.agenceId = agenceId;
  if (type) where.type = type;
  if (statut) where.statut = statut;
  if (devise) where.devise = devise;
  if (search) {
    where.OR = [
      { numeroCompte: { contains: search, mode: 'insensitive' } },
      { client: { nom: { contains: search, mode: 'insensitive' } } },
      { client: { prenom: { contains: search, mode: 'insensitive' } } },
      { client: { raisonSociale: { contains: search, mode: 'insensitive' } } },
    ];
  }

  const [total, items] = await Promise.all([
    prisma.compte.count({ where }),
    prisma.compte.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        client: { select: { id: true, numeroClient: true, nom: true, prenom: true, raisonSociale: true, type: true } },
        agence: { select: { id: true, code: true, nom: true } },
      },
    }),
  ]);

  return { items, total, page, limit, pages: Math.ceil(total / limit) };
}

export async function getCompte(id: string) {
  const compte = await prisma.compte.findUnique({
    where: { id },
    include: {
      client: { select: { id: true, numeroClient: true, nom: true, prenom: true, raisonSociale: true, type: true, telephone: true } },
      agence: { select: { id: true, code: true, nom: true } },
    },
  });
  if (!compte) throw new AppError(404, 'Compte introuvable');
  return compte;
}

export async function createCompte(data: {
  clientId: string;
  agenceId: string;
  type: TypeCompte;
  devise?: Devise;
  soldeInitial?: number;
  soldeMinimum?: number;
  intitule?: string;
  tauxInteret?: number;
  dateEcheance?: Date;
  agentAgenceId?: string | null;
}, userId?: string) {
  const { clientId, agenceId, type, devise = 'HTG', soldeInitial = 0, agentAgenceId, ...rest } = data;

  // Un agent lié à une agence ne peut ouvrir un compte que pour sa propre agence
  if (agentAgenceId && agentAgenceId !== agenceId) throw new AppError(403, 'Vous ne pouvez ouvrir un compte que pour votre propre agence');

  const client = await prisma.client.findUnique({ where: { id: clientId } });
  if (!client || client.statut !== 'ACTIF') throw new AppError(400, 'Client inactif ou introuvable');

  const agence = await prisma.agence.findUnique({ where: { id: agenceId } });
  if (!agence) throw new AppError(404, 'Agence introuvable');

  // Lire les règles d'ouverture depuis la configuration
  const [soldeMinConfig, fraisConfig] = await Promise.all([
    getConfig('SOLDE_MINIMUM_OUVERTURE'),
    getConfig('FRAIS_OUVERTURE_COMPTE'),
  ]);
  const soldeMin = parseFloat(soldeMinConfig || '0');
  const fraisOuverture = parseFloat(fraisConfig || '0');

  // Le dépôt initial doit couvrir le minimum requis + les frais d'ouverture
  const minimumRequis = soldeMin + fraisOuverture;
  if (minimumRequis > 0 && soldeInitial < minimumRequis) {
    const details = fraisOuverture > 0
      ? `minimum requis ${soldeMin} ${devise} + frais d'ouverture ${fraisOuverture} ${devise} = ${minimumRequis} ${devise}`
      : `minimum requis ${soldeMin} ${devise}`;
    throw new AppError(400, `Solde d'ouverture insuffisant. ${details}`);
  }

  const numeroCompte = await generateNumeroCompte(agence.code, type, devise);

  const compte = await prisma.$transaction(async (tx) => {
    const created = await tx.compte.create({
      data: {
        numeroCompte,
        clientId,
        agenceId,
        type,
        devise,
        solde: soldeInitial,
        ...rest,
      },
      include: {
        client: { select: { id: true, numeroClient: true, nom: true, prenom: true, raisonSociale: true } },
        agence: { select: { id: true, code: true, nom: true } },
      },
    });

    // Dépôt initial : sans écriture, l'argent apparaît sur le solde du compte
    // sans jamais entrer en caisse comptablement — cause de déséquilibre du bilan.
    if (soldeInitial > 0) {
      await creerEcritureAuto(tx, {
        debitNumero:  '5700',
        creditNumero: '2600',
        montant:      soldeInitial,
        libelle:      `Dépôt d'ouverture — ${created.numeroCompte}`,
        date:         new Date(),
        userId:       userId || 'SYSTEM',
      });
    }

    // Prélever les frais d'ouverture si configurés
    if (fraisOuverture > 0) {
      const reference = await generateReferenceTransaction('FRAIS');
      const libelle = `Frais d'ouverture de compte — ${created.numeroCompte}`;
      const txFrais = await tx.transaction.create({
        data: {
          reference,
          type: 'FRAIS',
          montant: fraisOuverture,
          devise: devise as any,
          soldeAvant: soldeInitial,
          soldeApres: soldeInitial - fraisOuverture,
          motif: libelle,
          statut: 'VALIDEE',
          compteDebitId: created.id,
          agenceExecutionId: agenceId,
          creeParId: userId || 'SYSTEM',
          valideParId: userId || 'SYSTEM',
        } as any,
      });
      await tx.compte.update({ where: { id: created.id }, data: { solde: { decrement: fraisOuverture } } });
      await creerEcritureAuto(tx, {
        debitNumero:  '2600',
        creditNumero: '7020',
        montant:      fraisOuverture,
        libelle,
        date:         new Date(),
        userId:       userId || 'SYSTEM',
        transactionId: txFrais.id,
      });
    }

    return created;
  });

  if (userId) await createAuditLog({ userId, table: 'comptes', action: 'CREATE', entiteId: compte.id, nouveau: { numeroCompte, type, devise, clientId, soldeInitial, fraisOuverture } });
  return compte;
}

export async function updateCompte(id: string, data: Partial<{ intitule: string; soldeMinimum: number; tauxInteret: number; dateEcheance: Date }>, userId?: string) {
  const existing = await prisma.compte.findUnique({ where: { id } });
  if (!existing) throw new AppError(404, 'Compte introuvable');
  const compte = await prisma.compte.update({ where: { id }, data });
  if (userId) await createAuditLog({ userId, table: 'comptes', action: 'UPDATE', entiteId: id, nouveau: data });
  return compte;
}

export async function changeStatutCompte(id: string, statut: StatutCompte, userId?: string) {
  const existing = await prisma.compte.findUnique({ where: { id } });
  if (!existing) throw new AppError(404, 'Compte introuvable');
  const compte = await prisma.compte.update({ where: { id }, data: { statut } });
  if (userId) await createAuditLog({ userId, table: 'comptes', action: 'STATUT', entiteId: id, ancien: { statut: existing.statut }, nouveau: { statut } });
  return compte;
}

export async function getReleveCompte(id: string, opts: { from?: Date; to?: Date; page?: number; limit?: number }) {
  const { from, to, page = 1, limit = 50 } = opts;
  const skip = (page - 1) * limit;

  const compte = await prisma.compte.findUnique({
    where: { id },
    include: { client: { select: { nom: true, prenom: true, raisonSociale: true, type: true } }, agence: true },
  });
  if (!compte) throw new AppError(404, 'Compte introuvable');

  const where: any = {
    OR: [{ compteDebitId: id }, { compteCreditId: id }],
    statut: 'VALIDEE',
  };
  if (from || to) {
    where.createdAt = {};
    if (from) where.createdAt.gte = from;
    if (to) where.createdAt.lte = to;
  }

  const [total, transactions] = await Promise.all([
    prisma.transaction.count({ where }),
    prisma.transaction.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: { creePar: { select: { nom: true, prenom: true } } },
    }),
  ]);

  return { compte, transactions, total, page, limit, pages: Math.ceil(total / limit) };
}

export async function cloturerCompte(id: string, userId: string) {
  const compte = await prisma.compte.findUnique({
    where: { id },
    include: { _count: { select: { epargnesSource: { where: { actif: true } }, epargnesDest: { where: { actif: true } } } } },
  });
  if (!compte) throw new AppError(404, 'Compte introuvable');
  if (compte.statut === 'CLOTURE') throw new AppError(400, 'Ce compte est déjà clôturé');
  if (Number(compte.solde) !== 0) throw new AppError(400, `Impossible de clôturer : solde non nul (${compte.solde})`);

  const pretsActifs = await prisma.pret.count({
    where: {
      clientId: compte.clientId,
      statut: { in: ['DECAISSE', 'EN_COURS', 'EN_RETARD'] },
    },
  });
  if (pretsActifs > 0) throw new AppError(400, 'Ce client a des prêts actifs liés à ce compte');

  const totalEpargnes = (compte as any)._count.epargnesSource + (compte as any)._count.epargnesDest;
  if (totalEpargnes > 0) throw new AppError(400, 'Désactivez d\'abord les épargnes programmées liées à ce compte');

  const updated = await prisma.compte.update({
    where: { id },
    data: { statut: 'CLOTURE', dateCloture: new Date() },
  });
  await createAuditLog({ userId, table: 'comptes', action: 'CLOTURE', entiteId: id, ancien: { statut: compte.statut }, nouveau: { statut: 'CLOTURE' } });
  return updated;
}

export async function searchComptes(q: string) {
  return prisma.compte.findMany({
    where: {
      statut: 'ACTIF',
      OR: [
        { numeroCompte: { contains: q, mode: 'insensitive' } },
        { client: { nom: { contains: q, mode: 'insensitive' } } },
        { client: { prenom: { contains: q, mode: 'insensitive' } } },
        { client: { raisonSociale: { contains: q, mode: 'insensitive' } } },
      ],
    },
    take: 10,
    include: {
      client: { select: { id: true, numeroClient: true, nom: true, prenom: true, raisonSociale: true, type: true } },
    },
  });
}
