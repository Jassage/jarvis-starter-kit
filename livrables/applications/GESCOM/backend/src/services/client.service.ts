import prisma from '../utils/prisma';
import { AppError } from '../types';
import { createAuditLog } from '../utils/audit';

export async function listClients(params: { search?: string; type?: string; actif?: boolean }) {
  const where: any = {};
  if (params.actif !== undefined) where.actif = params.actif;
  if (params.type) where.type = params.type;
  if (params.search) {
    where.OR = [
      { nom: { contains: params.search, mode: 'insensitive' } },
      { telephone: { contains: params.search, mode: 'insensitive' } },
    ];
  }
  return prisma.client.findMany({ where, orderBy: { nom: 'asc' } });
}

export async function createClient(data: any, userId: string) {
  const client = await prisma.client.create({ data });
  await createAuditLog({ userId, table: 'clients', action: 'CREATE', entiteId: client.id, nouveau: data });
  return client;
}

export async function updateClient(id: string, data: any, userId: string) {
  const client = await prisma.client.update({ where: { id }, data });
  await createAuditLog({ userId, table: 'clients', action: 'UPDATE', entiteId: id, nouveau: data });
  return client;
}

export async function archiveClient(id: string, userId: string) {
  const hasVentesCredit = await prisma.vente.findFirst({
    where: { clientId: id, modePaiement: 'CREDIT', statut: 'VALIDEE' },
  });
  if (hasVentesCredit) {
    const client = await prisma.client.findUnique({ where: { id } });
    if (client && Number(client.soldeDu) > 0) {
      throw new AppError(400, 'Ce client a un solde dû positif — réglez le solde avant de l\'archiver');
    }
  }
  const client = await prisma.client.update({ where: { id }, data: { actif: false } });
  await createAuditLog({ userId, table: 'clients', action: 'ARCHIVE', entiteId: id });
  return client;
}
