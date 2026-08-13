import { Locale, StatutPublication } from '@prisma/client';
import prisma from '../../config/database';
import { AppError } from '../../types';

interface TraductionInput {
  locale: Locale;
  description: string;
}

interface RestaurantInput {
  nom: string;
  cuisine?: string;
  prix?: string;
  adresse?: string;
  telephone?: string;
  horaires?: string;
  latitude?: number;
  longitude?: number;
  statutPublication: StatutPublication;
  photoId?: string;
  ordre: number;
  traductions: TraductionInput[];
}

const includePourAffichage = { traductions: true, photo: true };
const orderByDefaut = { ordre: 'asc' as const };

export async function listPublique() {
  return prisma.restaurant.findMany({ where: { statutPublication: 'PUBLIE' }, orderBy: orderByDefaut, include: includePourAffichage });
}

export async function listAdmin() {
  return prisma.restaurant.findMany({ orderBy: orderByDefaut, include: includePourAffichage });
}

export async function create(data: RestaurantInput) {
  return prisma.restaurant.create({
    data: {
      nom: data.nom,
      cuisine: data.cuisine,
      prix: data.prix,
      adresse: data.adresse,
      telephone: data.telephone,
      horaires: data.horaires,
      latitude: data.latitude,
      longitude: data.longitude,
      statutPublication: data.statutPublication,
      photoId: data.photoId,
      ordre: data.ordre,
      traductions: { create: data.traductions.map((t) => ({ locale: t.locale, description: t.description })) },
    },
    include: includePourAffichage,
  });
}

export async function update(
  id: string,
  data: Partial<Omit<RestaurantInput, 'traductions'>> & { traductions?: TraductionInput[] }
) {
  const existing = await prisma.restaurant.findUnique({ where: { id } });
  if (!existing) throw new AppError(404, 'Restaurant introuvable');

  return prisma.restaurant.update({
    where: { id },
    data: {
      ...(data.nom !== undefined && { nom: data.nom }),
      ...(data.cuisine !== undefined && { cuisine: data.cuisine }),
      ...(data.prix !== undefined && { prix: data.prix }),
      ...(data.adresse !== undefined && { adresse: data.adresse }),
      ...(data.telephone !== undefined && { telephone: data.telephone }),
      ...(data.horaires !== undefined && { horaires: data.horaires }),
      ...(data.latitude !== undefined && { latitude: data.latitude }),
      ...(data.longitude !== undefined && { longitude: data.longitude }),
      ...(data.statutPublication !== undefined && { statutPublication: data.statutPublication }),
      ...(data.photoId !== undefined && { photoId: data.photoId }),
      ...(data.ordre !== undefined && { ordre: data.ordre }),
      ...(data.traductions && {
        traductions: {
          upsert: data.traductions.map((t) => ({
            where: { restaurantId_locale: { restaurantId: id, locale: t.locale } },
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
  const existing = await prisma.restaurant.findUnique({ where: { id } });
  if (!existing) throw new AppError(404, 'Restaurant introuvable');
  await prisma.restaurant.delete({ where: { id } });
}
