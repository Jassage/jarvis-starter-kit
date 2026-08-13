import { StatutPublication } from '@prisma/client';
import prisma from '../../config/database';
import { AppError } from '../../types';

interface DocumentInput {
  titre: string;
  description?: string;
  mediaId: string;
  statutPublication: StatutPublication;
  ordre: number;
}

const includePourAffichage = { media: true };

export async function listPublique() {
  return prisma.document.findMany({
    where: { statutPublication: 'PUBLIE' },
    orderBy: { ordre: 'asc' },
    include: includePourAffichage,
  });
}

export async function listAdmin() {
  return prisma.document.findMany({
    orderBy: { ordre: 'asc' },
    include: includePourAffichage,
  });
}

export async function create(data: DocumentInput) {
  return prisma.document.create({ data, include: includePourAffichage });
}

export async function update(id: string, data: Partial<DocumentInput>) {
  const existing = await prisma.document.findUnique({ where: { id } });
  if (!existing) throw new AppError(404, 'Document introuvable');

  return prisma.document.update({
    where: { id },
    data: {
      ...(data.titre !== undefined && { titre: data.titre }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.mediaId !== undefined && { mediaId: data.mediaId }),
      ...(data.statutPublication !== undefined && { statutPublication: data.statutPublication }),
      ...(data.ordre !== undefined && { ordre: data.ordre }),
    },
    include: includePourAffichage,
  });
}

export async function remove(id: string) {
  const existing = await prisma.document.findUnique({ where: { id } });
  if (!existing) throw new AppError(404, 'Document introuvable');
  await prisma.document.delete({ where: { id } });
}
