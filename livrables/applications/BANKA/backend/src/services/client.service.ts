import prisma from '../utils/prisma';
import { generateNumeroClient } from '../utils/reference';
import { AppError } from '../types';
import { TypeClient, StatutClient } from '@prisma/client';
import { createAuditLog } from '../utils/audit';

export async function listClients(opts: {
  search?: string;
  statut?: StatutClient;
  type?: TypeClient;
  page?: number;
  limit?: number;
}) {
  const { search, statut, type, page = 1, limit = 20 } = opts;
  const skip = (page - 1) * limit;

  const where: any = {};
  if (statut) where.statut = statut;
  if (type) where.type = type;
  if (search) {
    where.OR = [
      { nom: { contains: search, mode: 'insensitive' } },
      { prenom: { contains: search, mode: 'insensitive' } },
      { raisonSociale: { contains: search, mode: 'insensitive' } },
      { numeroClient: { contains: search, mode: 'insensitive' } },
      { telephone: { contains: search } },
    ];
  }

  const [total, items] = await Promise.all([
    prisma.client.count({ where }),
    prisma.client.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        _count: { select: { comptes: true, prets: true } },
      },
    }),
  ]);

  return { items, total, page, limit, pages: Math.ceil(total / limit) };
}

export async function getClient(id: string) {
  const client = await prisma.client.findUnique({
    where: { id },
    include: {
      comptes: {
        include: { agence: { select: { code: true, nom: true } } },
        orderBy: { createdAt: 'asc' },
      },
      prets: {
        orderBy: { createdAt: 'desc' },
        select: {
          id: true, reference: true, montant: true, statut: true,
          tauxMensuel: true, dureeMois: true, devise: true,
          montantTotal: true, montantRembourse: true, resteARegler: true,
          dateDemande: true, dateDecaissement: true,
        },
      },
    },
  });
  if (!client) throw new AppError(404, 'Client introuvable');
  return client;
}

export async function createClient(data: {
  type: TypeClient;
  nom?: string;
  prenom?: string;
  dateNaissance?: Date;
  lieuNaissance?: string;
  raisonSociale?: string;
  nif?: string;
  pieceIdentite?: string;
  numeroPiece?: string;
  telephone: string;
  email?: string;
  adresse?: string;
  profession?: string;
  notes?: string;
}, userId?: string) {
  const numeroClient = await generateNumeroClient();
  const client = await prisma.client.create({ data: { ...data, adresse: data.adresse ?? '', numeroClient } });
  if (userId) await createAuditLog({ userId, table: 'clients', action: 'CREATE', entiteId: client.id, nouveau: { numeroClient, type: client.type, telephone: client.telephone } });
  return client;
}

export async function updateClient(id: string, data: Partial<Omit<Parameters<typeof createClient>[0], 'type'>>, userId?: string) {
  const existing = await prisma.client.findUnique({ where: { id } });
  if (!existing) throw new AppError(404, 'Client introuvable');
  const client = await prisma.client.update({ where: { id }, data });
  if (userId) await createAuditLog({ userId, table: 'clients', action: 'UPDATE', entiteId: id, nouveau: data });
  return client;
}

export async function changeStatutClient(id: string, statut: StatutClient, userId?: string) {
  const existing = await prisma.client.findUnique({ where: { id } });
  if (!existing) throw new AppError(404, 'Client introuvable');
  const client = await prisma.client.update({ where: { id }, data: { statut } });
  if (userId) await createAuditLog({ userId, table: 'clients', action: 'STATUT', entiteId: id, ancien: { statut: existing.statut }, nouveau: { statut } });
  return client;
}

export async function deleteClient(id: string, userId: string) {
  const client = await prisma.client.findUnique({
    where: { id },
    include: {
      comptes: { where: { statut: { in: ['ACTIF', 'SUSPENDU'] as any } }, select: { id: true, numeroCompte: true } },
      prets:   { where: { statut: { notIn: ['REMBOURSE', 'REJETE', 'ANNULE'] as any } }, select: { id: true, reference: true } },
    },
  });
  if (!client) throw new AppError(404, 'Client introuvable');
  if (client.comptes.length > 0)
    throw new AppError(400, `Impossible : ${client.comptes.length} compte(s) actif(s) encore ouvert(s)`);
  if (client.prets.length > 0)
    throw new AppError(400, `Impossible : ${client.prets.length} prêt(s) non soldé(s)`);

  // Suppression logique uniquement — on ne supprime jamais les données bancaires
  const updated = await prisma.client.update({ where: { id }, data: { statut: 'INACTIF' as any } });
  await createAuditLog({ userId, table: 'clients', action: 'DELETE', entiteId: id, ancien: { statut: client.statut } });
  return updated;
}

export async function searchClients(q: string) {
  return prisma.client.findMany({
    where: {
      statut: 'ACTIF',
      OR: [
        { nom: { contains: q, mode: 'insensitive' } },
        { prenom: { contains: q, mode: 'insensitive' } },
        { raisonSociale: { contains: q, mode: 'insensitive' } },
        { numeroClient: { contains: q, mode: 'insensitive' } },
        { telephone: { contains: q } },
      ],
    },
    take: 10,
    select: {
      id: true, numeroClient: true, type: true,
      nom: true, prenom: true, raisonSociale: true, telephone: true,
    },
  });
}
