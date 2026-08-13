import { CategorieEvenement, Locale, StatutPublication } from '@prisma/client';
import prisma from '../../config/database';
import { AppError } from '../../types';

interface TraductionInput {
  locale: Locale;
  description: string;
}

interface EvenementInput {
  nom: string;
  categorie: CategorieEvenement;
  date: Date;
  heureAffichage?: string;
  lieu: string;
  organisateur?: string;
  latitude?: number;
  longitude?: number;
  statutPublication: StatutPublication;
  imagePrincipaleId?: string;
  ordre: number;
  traductions: TraductionInput[];
}

const includePourAffichage = {
  traductions: true,
  imagePrincipale: true,
};

// Agenda public = uniquement les événements à venir (date non passée), jamais un brouillon.
export async function listPublique(categorie?: CategorieEvenement, q?: string) {
  return prisma.evenement.findMany({
    where: {
      statutPublication: 'PUBLIE',
      date: { gte: new Date(new Date().toISOString().slice(0, 10)) },
      ...(categorie && { categorie }),
      ...(q && {
        OR: [
          { nom: { contains: q, mode: 'insensitive' } },
          { lieu: { contains: q, mode: 'insensitive' } },
          { traductions: { some: { description: { contains: q, mode: 'insensitive' } } } },
        ],
      }),
    },
    orderBy: { date: 'asc' },
    include: includePourAffichage,
  });
}

export async function listAdmin() {
  return prisma.evenement.findMany({
    orderBy: { date: 'asc' },
    include: includePourAffichage,
  });
}

export async function create(data: EvenementInput) {
  return prisma.evenement.create({
    data: {
      nom: data.nom,
      categorie: data.categorie,
      date: data.date,
      heureAffichage: data.heureAffichage,
      lieu: data.lieu,
      organisateur: data.organisateur,
      latitude: data.latitude,
      longitude: data.longitude,
      statutPublication: data.statutPublication,
      imagePrincipaleId: data.imagePrincipaleId,
      ordre: data.ordre,
      traductions: {
        create: data.traductions.map((t) => ({ locale: t.locale, description: t.description })),
      },
    },
    include: includePourAffichage,
  });
}

export async function update(
  id: string,
  data: Partial<Omit<EvenementInput, 'traductions'>> & { traductions?: TraductionInput[] }
) {
  const existing = await prisma.evenement.findUnique({ where: { id } });
  if (!existing) throw new AppError(404, 'Événement introuvable');

  return prisma.evenement.update({
    where: { id },
    data: {
      ...(data.nom !== undefined && { nom: data.nom }),
      ...(data.categorie !== undefined && { categorie: data.categorie }),
      ...(data.date !== undefined && { date: data.date }),
      ...(data.heureAffichage !== undefined && { heureAffichage: data.heureAffichage }),
      ...(data.lieu !== undefined && { lieu: data.lieu }),
      ...(data.organisateur !== undefined && { organisateur: data.organisateur }),
      ...(data.latitude !== undefined && { latitude: data.latitude }),
      ...(data.longitude !== undefined && { longitude: data.longitude }),
      ...(data.statutPublication !== undefined && { statutPublication: data.statutPublication }),
      ...(data.imagePrincipaleId !== undefined && { imagePrincipaleId: data.imagePrincipaleId }),
      ...(data.ordre !== undefined && { ordre: data.ordre }),
      ...(data.traductions && {
        traductions: {
          upsert: data.traductions.map((t) => ({
            where: { evenementId_locale: { evenementId: id, locale: t.locale } },
            create: { locale: t.locale, description: t.description },
            update: { description: t.description },
          })),
        },
      }),
    },
    include: includePourAffichage,
  });
}

export async function remove(id: string) {
  const existing = await prisma.evenement.findUnique({ where: { id } });
  if (!existing) throw new AppError(404, 'Événement introuvable');
  await prisma.evenement.delete({ where: { id } });
}
