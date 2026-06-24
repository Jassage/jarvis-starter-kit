import prisma from '../utils/prisma';
import { generateNumeroCompte } from '../utils/reference';
import { AppError } from '../types';
import { TypeCompte, Devise, StatutCompte } from '@prisma/client';
import { createAuditLog } from '../utils/audit';

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
}, userId?: string) {
  const { clientId, agenceId, type, devise = 'HTG', soldeInitial = 0, ...rest } = data;

  const client = await prisma.client.findUnique({ where: { id: clientId } });
  if (!client || client.statut !== 'ACTIF') throw new AppError(400, 'Client inactif ou introuvable');

  const agence = await prisma.agence.findUnique({ where: { id: agenceId } });
  if (!agence) throw new AppError(404, 'Agence introuvable');

  const numeroCompte = await generateNumeroCompte(agence.code, type, devise);

  const compte = await prisma.compte.create({
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
  if (userId) await createAuditLog({ userId, table: 'comptes', action: 'CREATE', entiteId: compte.id, nouveau: { numeroCompte, type, devise, clientId } });
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
