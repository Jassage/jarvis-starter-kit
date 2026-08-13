import prisma from '../../config/database';

export async function list(pharmacieId: string) {
  return prisma.categorie.findMany({ where: { pharmacieId }, orderBy: { nom: 'asc' } });
}

export async function create(pharmacieId: string, data: { nom: string; description?: string }) {
  return prisma.categorie.create({ data: { ...data, pharmacieId } });
}
