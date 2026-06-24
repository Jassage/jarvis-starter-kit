import prisma from '../utils/prisma';
import { AppError } from '../types';

export async function listAgences() {
  return prisma.agence.findMany({
    orderBy: { nom: 'asc' },
    include: {
      _count: { select: { utilisateurs: true, comptes: true, prets: true } },
    },
  });
}

export async function getAgence(id: string) {
  const agence = await prisma.agence.findUnique({
    where: { id },
    include: {
      utilisateurs: { select: { id: true, prenom: true, nom: true, role: true, actif: true } },
      _count: { select: { comptes: true, prets: true, sessions: true } },
    },
  });
  if (!agence) throw new AppError(404, 'Agence introuvable');
  return agence;
}

export async function createAgence(data: {
  code: string;
  nom: string;
  adresse?: string;
  telephone?: string;
}) {
  const existe = await prisma.agence.findUnique({ where: { code: data.code } });
  if (existe) throw new AppError(400, `Le code agence "${data.code}" est déjà utilisé`);
  return prisma.agence.create({ data });
}

export async function updateAgence(id: string, data: Partial<{ nom: string; adresse: string; telephone: string; actif: boolean }>) {
  const agence = await prisma.agence.findUnique({ where: { id } });
  if (!agence) throw new AppError(404, 'Agence introuvable');
  return prisma.agence.update({ where: { id }, data });
}
