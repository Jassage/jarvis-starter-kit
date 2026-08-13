import { StatutMessage } from '@prisma/client';
import prisma from '../../config/database';
import { AppError } from '../../types';

interface MessageContactInput {
  nom: string;
  email: string;
  telephone?: string;
  sujet?: string;
  message: string;
}

export async function create(data: MessageContactInput) {
  return prisma.messageContact.create({ data });
}

export async function list(statut?: StatutMessage) {
  return prisma.messageContact.findMany({
    where: { ...(statut && { statut }) },
    orderBy: { createdAt: 'desc' },
  });
}

export async function updateStatut(id: string, statut: StatutMessage) {
  const existing = await prisma.messageContact.findUnique({ where: { id } });
  if (!existing) throw new AppError(404, 'Message introuvable');
  return prisma.messageContact.update({ where: { id }, data: { statut } });
}

export async function remove(id: string) {
  const existing = await prisma.messageContact.findUnique({ where: { id } });
  if (!existing) throw new AppError(404, 'Message introuvable');
  await prisma.messageContact.delete({ where: { id } });
}
