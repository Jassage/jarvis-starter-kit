import prisma from '../utils/prisma';

export async function listEmplacements() {
  return prisma.emplacement.findMany({ where: { actif: true }, orderBy: { nom: 'asc' } });
}
