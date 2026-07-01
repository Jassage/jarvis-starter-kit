import prisma from '../utils/prisma';
import { AppError } from '../types';
import { createAuditLog } from '../utils/audit';

export async function listFournisseurs(search?: string) {
  const where = search
    ? { OR: [{ nom: { contains: search, mode: 'insensitive' as const } }, { telephone: { contains: search, mode: 'insensitive' as const } }] }
    : {};
  return prisma.fournisseur.findMany({ where: { ...where, actif: true }, orderBy: { nom: 'asc' } });
}

export async function createFournisseur(data: any, userId: string) {
  const fournisseur = await prisma.fournisseur.create({ data });
  await createAuditLog({ userId, table: 'fournisseurs', action: 'CREATE', entiteId: fournisseur.id, nouveau: data });
  return fournisseur;
}

export async function updateFournisseur(id: string, data: any, userId: string) {
  const fournisseur = await prisma.fournisseur.update({ where: { id }, data });
  await createAuditLog({ userId, table: 'fournisseurs', action: 'UPDATE', entiteId: id, nouveau: data });
  return fournisseur;
}

export async function archiveFournisseur(id: string, userId: string) {
  const hasCommandes = await prisma.commandeFournisseur.findFirst({
    where: { fournisseurId: id, statut: { in: ['BROUILLON', 'ENVOYEE', 'RECUE_PARTIELLE'] } },
  });
  if (hasCommandes) throw new AppError(400, 'Ce fournisseur a des commandes en cours — finalisez-les avant d\'archiver');
  const fournisseur = await prisma.fournisseur.update({ where: { id }, data: { actif: false } });
  await createAuditLog({ userId, table: 'fournisseurs', action: 'ARCHIVE', entiteId: id });
  return fournisseur;
}
