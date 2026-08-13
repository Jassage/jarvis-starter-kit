import { Locale, StatutPublication } from '@prisma/client';
import prisma from '../../config/database';
import { AppError } from '../../types';

interface TraductionInput {
  locale: Locale;
  description: string;
}

interface HotelInput {
  nom: string;
  nombreChambres?: number;
  servicesDisponibles: string[];
  prixMin?: number;
  prixMax?: number;
  adresse?: string;
  telephone?: string;
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
  return prisma.hotel.findMany({ where: { statutPublication: 'PUBLIE' }, orderBy: orderByDefaut, include: includePourAffichage });
}

export async function listAdmin() {
  return prisma.hotel.findMany({ orderBy: orderByDefaut, include: includePourAffichage });
}

export async function create(data: HotelInput) {
  return prisma.hotel.create({
    data: {
      nom: data.nom,
      nombreChambres: data.nombreChambres,
      servicesDisponibles: data.servicesDisponibles,
      prixMin: data.prixMin,
      prixMax: data.prixMax,
      adresse: data.adresse,
      telephone: data.telephone,
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
  data: Partial<Omit<HotelInput, 'traductions'>> & { traductions?: TraductionInput[] }
) {
  const existing = await prisma.hotel.findUnique({ where: { id } });
  if (!existing) throw new AppError(404, 'Hôtel introuvable');

  return prisma.hotel.update({
    where: { id },
    data: {
      ...(data.nom !== undefined && { nom: data.nom }),
      ...(data.nombreChambres !== undefined && { nombreChambres: data.nombreChambres }),
      ...(data.servicesDisponibles !== undefined && { servicesDisponibles: data.servicesDisponibles }),
      ...(data.prixMin !== undefined && { prixMin: data.prixMin }),
      ...(data.prixMax !== undefined && { prixMax: data.prixMax }),
      ...(data.adresse !== undefined && { adresse: data.adresse }),
      ...(data.telephone !== undefined && { telephone: data.telephone }),
      ...(data.latitude !== undefined && { latitude: data.latitude }),
      ...(data.longitude !== undefined && { longitude: data.longitude }),
      ...(data.statutPublication !== undefined && { statutPublication: data.statutPublication }),
      ...(data.photoId !== undefined && { photoId: data.photoId }),
      ...(data.ordre !== undefined && { ordre: data.ordre }),
      ...(data.traductions && {
        traductions: {
          upsert: data.traductions.map((t) => ({
            where: { hotelId_locale: { hotelId: id, locale: t.locale } },
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
  const existing = await prisma.hotel.findUnique({ where: { id } });
  if (!existing) throw new AppError(404, 'Hôtel introuvable');
  await prisma.hotel.delete({ where: { id } });
}
