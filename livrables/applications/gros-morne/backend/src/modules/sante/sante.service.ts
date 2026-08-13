import { Locale, StatutPublication, TypeSante } from '@prisma/client';
import prisma from '../../config/database';
import { AppError } from '../../types';

interface TraductionInput {
  locale: Locale;
  description: string;
}

interface HealthFacilityInput {
  nom: string;
  type: TypeSante;
  services: string[];
  medecins?: string;
  adresse?: string;
  telephone?: string;
  urgence: boolean;
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

export async function listPublique(type?: TypeSante) {
  return prisma.healthFacility.findMany({
    where: { statutPublication: 'PUBLIE', ...(type && { type }) },
    orderBy: orderByDefaut,
    include: includePourAffichage,
  });
}

export async function listAdmin() {
  return prisma.healthFacility.findMany({ orderBy: orderByDefaut, include: includePourAffichage });
}

export async function create(data: HealthFacilityInput) {
  return prisma.healthFacility.create({
    data: {
      nom: data.nom,
      type: data.type,
      services: data.services,
      medecins: data.medecins,
      adresse: data.adresse,
      telephone: data.telephone,
      urgence: data.urgence,
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
  data: Partial<Omit<HealthFacilityInput, 'traductions'>> & { traductions?: TraductionInput[] }
) {
  const existing = await prisma.healthFacility.findUnique({ where: { id } });
  if (!existing) throw new AppError(404, 'Structure de santé introuvable');

  return prisma.healthFacility.update({
    where: { id },
    data: {
      ...(data.nom !== undefined && { nom: data.nom }),
      ...(data.type !== undefined && { type: data.type }),
      ...(data.services !== undefined && { services: data.services }),
      ...(data.medecins !== undefined && { medecins: data.medecins }),
      ...(data.adresse !== undefined && { adresse: data.adresse }),
      ...(data.telephone !== undefined && { telephone: data.telephone }),
      ...(data.urgence !== undefined && { urgence: data.urgence }),
      ...(data.horaires !== undefined && { horaires: data.horaires }),
      ...(data.latitude !== undefined && { latitude: data.latitude }),
      ...(data.longitude !== undefined && { longitude: data.longitude }),
      ...(data.statutPublication !== undefined && { statutPublication: data.statutPublication }),
      ...(data.photoId !== undefined && { photoId: data.photoId }),
      ...(data.ordre !== undefined && { ordre: data.ordre }),
      ...(data.traductions && {
        traductions: {
          upsert: data.traductions.map((t) => ({
            where: { healthFacilityId_locale: { healthFacilityId: id, locale: t.locale } },
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
  const existing = await prisma.healthFacility.findUnique({ where: { id } });
  if (!existing) throw new AppError(404, 'Structure de santé introuvable');
  await prisma.healthFacility.delete({ where: { id } });
}
