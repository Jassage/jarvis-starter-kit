import prisma from '../../config/database';
import { AppError } from '../../types';

interface ClientInput {
  nom: string;
  prenom?: string;
  telephone?: string;
  email?: string;
  adresse?: string;
  dateNaissance?: Date;
  sexe?: string;
  notes?: string;
}

export async function list(pharmacieId: string, recherche?: string) {
  return prisma.client.findMany({
    where: {
      pharmacieId,
      ...(recherche
        ? {
            OR: [
              { nom: { contains: recherche, mode: 'insensitive' } },
              { prenom: { contains: recherche, mode: 'insensitive' } },
              { telephone: { contains: recherche, mode: 'insensitive' } },
            ],
          }
        : {}),
    },
    orderBy: { nom: 'asc' },
  });
}

export async function getById(pharmacieId: string, id: string) {
  const client = await prisma.client.findFirst({
    where: { id, pharmacieId },
    include: {
      ventes: {
        orderBy: { createdAt: 'desc' },
        take: 20,
        select: { id: true, numero: true, montantTotal: true, statut: true, createdAt: true },
      },
    },
  });
  if (!client) throw new AppError(404, 'Client introuvable');
  return client;
}

export async function create(pharmacieId: string, data: ClientInput) {
  return prisma.client.create({ data: { ...data, pharmacieId } });
}

export async function update(pharmacieId: string, id: string, data: Partial<ClientInput>) {
  const existe = await prisma.client.findFirst({ where: { id, pharmacieId } });
  if (!existe) throw new AppError(404, 'Client introuvable');
  return prisma.client.update({ where: { id }, data });
}
