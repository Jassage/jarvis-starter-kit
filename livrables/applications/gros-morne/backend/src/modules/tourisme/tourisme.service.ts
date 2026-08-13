import { CategorieTourisme, Locale, StatutPublication } from '@prisma/client';
import prisma from '../../config/database';
import { AppError } from '../../types';

interface TraductionInput {
  locale: Locale;
  description: string;
  conseils?: string;
}

interface TourismPlaceInput {
  nom: string;
  categorie: CategorieTourisme;
  duree?: string;
  difficulte?: string;
  tags: string[];
  latitude?: number;
  longitude?: number;
  horaires?: string;
  tarif?: string;
  telephone?: string;
  servicesDisponibles: string[];
  statutPublication: StatutPublication;
  ordre: number;
  mediaIds: string[];
  traductions: TraductionInput[];
}

const includePourAffichage = {
  traductions: true,
  photos: { include: { media: true }, orderBy: { ordre: 'asc' as const } },
};

export async function listPublique(categorie?: CategorieTourisme, q?: string) {
  return prisma.tourismPlace.findMany({
    where: {
      statutPublication: 'PUBLIE',
      ...(categorie && { categorie }),
      ...(q && {
        OR: [
          { nom: { contains: q, mode: 'insensitive' } },
          { traductions: { some: { description: { contains: q, mode: 'insensitive' } } } },
        ],
      }),
    },
    orderBy: { ordre: 'asc' },
    include: includePourAffichage,
  });
}

export async function listAdmin() {
  return prisma.tourismPlace.findMany({
    orderBy: { ordre: 'asc' },
    include: includePourAffichage,
  });
}

function photosCreateData(mediaIds: string[]) {
  return mediaIds.map((mediaId, index) => ({ mediaId, ordre: index }));
}

export async function create(data: TourismPlaceInput) {
  return prisma.tourismPlace.create({
    data: {
      nom: data.nom,
      categorie: data.categorie,
      duree: data.duree,
      difficulte: data.difficulte,
      tags: data.tags,
      latitude: data.latitude,
      longitude: data.longitude,
      horaires: data.horaires,
      tarif: data.tarif,
      telephone: data.telephone,
      servicesDisponibles: data.servicesDisponibles,
      statutPublication: data.statutPublication,
      ordre: data.ordre,
      traductions: {
        create: data.traductions.map((t) => ({
          locale: t.locale,
          description: t.description,
          conseils: t.conseils,
        })),
      },
      photos: { create: photosCreateData(data.mediaIds) },
    },
    include: includePourAffichage,
  });
}

export async function update(
  id: string,
  data: Partial<Omit<TourismPlaceInput, 'traductions' | 'mediaIds'>> & {
    traductions?: TraductionInput[];
    mediaIds?: string[];
  }
) {
  const existing = await prisma.tourismPlace.findUnique({ where: { id } });
  if (!existing) throw new AppError(404, 'Lieu touristique introuvable');

  return prisma.tourismPlace.update({
    where: { id },
    data: {
      ...(data.nom !== undefined && { nom: data.nom }),
      ...(data.categorie !== undefined && { categorie: data.categorie }),
      ...(data.duree !== undefined && { duree: data.duree }),
      ...(data.difficulte !== undefined && { difficulte: data.difficulte }),
      ...(data.tags !== undefined && { tags: data.tags }),
      ...(data.latitude !== undefined && { latitude: data.latitude }),
      ...(data.longitude !== undefined && { longitude: data.longitude }),
      ...(data.horaires !== undefined && { horaires: data.horaires }),
      ...(data.tarif !== undefined && { tarif: data.tarif }),
      ...(data.telephone !== undefined && { telephone: data.telephone }),
      ...(data.servicesDisponibles !== undefined && { servicesDisponibles: data.servicesDisponibles }),
      ...(data.statutPublication !== undefined && { statutPublication: data.statutPublication }),
      ...(data.ordre !== undefined && { ordre: data.ordre }),
      ...(data.traductions && {
        traductions: {
          upsert: data.traductions.map((t) => ({
            where: { tourismPlaceId_locale: { tourismPlaceId: id, locale: t.locale } },
            create: { locale: t.locale, description: t.description, conseils: t.conseils },
            update: { description: t.description, conseils: t.conseils },
          })),
        },
      }),
      ...(data.mediaIds !== undefined && {
        photos: {
          deleteMany: {},
          create: photosCreateData(data.mediaIds),
        },
      }),
    },
    include: includePourAffichage,
  });
}

export async function remove(id: string) {
  const existing = await prisma.tourismPlace.findUnique({ where: { id } });
  if (!existing) throw new AppError(404, 'Lieu touristique introuvable');
  await prisma.tourismPlace.delete({ where: { id } });
}
