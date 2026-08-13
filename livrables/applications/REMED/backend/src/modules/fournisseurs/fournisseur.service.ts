import prisma from '../../config/database';
import { AppError } from '../../types';

export async function list(pharmacieId: string, includeInactifs: boolean) {
  return prisma.fournisseur.findMany({
    where: { pharmacieId, actif: includeInactifs ? undefined : true },
    orderBy: { nom: 'asc' },
  });
}

export async function getById(pharmacieId: string, id: string) {
  const fournisseur = await prisma.fournisseur.findFirst({ where: { id, pharmacieId } });
  if (!fournisseur) throw new AppError(404, 'Fournisseur introuvable');
  return fournisseur;
}

export async function create(
  pharmacieId: string,
  data: { nom: string; contact?: string; telephone?: string; email?: string; adresse?: string }
) {
  return prisma.fournisseur.create({ data: { ...data, pharmacieId } });
}

export async function update(
  pharmacieId: string,
  id: string,
  data: Partial<{ nom: string; contact: string; telephone: string; email: string; adresse: string; actif: boolean }>
) {
  await getById(pharmacieId, id);
  return prisma.fournisseur.update({ where: { id }, data });
}
