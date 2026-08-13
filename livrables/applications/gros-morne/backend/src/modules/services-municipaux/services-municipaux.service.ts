import { Locale, StatutPublication, TypeServiceMunicipal } from '@prisma/client';
import prisma from '../../config/database';
import { AppError } from '../../types';

interface TraductionInput {
  locale: Locale;
  presentation: string;
}

interface MunicipalServiceInput {
  nom: string;
  type: TypeServiceMunicipal;
  responsable?: string;
  adresse?: string;
  telephone?: string;
  horaires?: string;
  latitude?: number;
  longitude?: number;
  statutPublication: StatutPublication;
  ordre: number;
  traductions: TraductionInput[];
}

const includePourAffichage = { traductions: true };
const orderByDefaut = { ordre: 'asc' as const };

export async function listPublique() {
  return prisma.municipalService.findMany({ where: { statutPublication: 'PUBLIE' }, orderBy: orderByDefaut, include: includePourAffichage });
}

export async function listAdmin() {
  return prisma.municipalService.findMany({ orderBy: orderByDefaut, include: includePourAffichage });
}

export async function create(data: MunicipalServiceInput) {
  return prisma.municipalService.create({
    data: {
      nom: data.nom,
      type: data.type,
      responsable: data.responsable,
      adresse: data.adresse,
      telephone: data.telephone,
      horaires: data.horaires,
      latitude: data.latitude,
      longitude: data.longitude,
      statutPublication: data.statutPublication,
      ordre: data.ordre,
      traductions: { create: data.traductions.map((t) => ({ locale: t.locale, presentation: t.presentation })) },
    },
    include: includePourAffichage,
  });
}

export async function update(
  id: string,
  data: Partial<Omit<MunicipalServiceInput, 'traductions'>> & { traductions?: TraductionInput[] }
) {
  const existing = await prisma.municipalService.findUnique({ where: { id } });
  if (!existing) throw new AppError(404, 'Service introuvable');

  return prisma.municipalService.update({
    where: { id },
    data: {
      ...(data.nom !== undefined && { nom: data.nom }),
      ...(data.type !== undefined && { type: data.type }),
      ...(data.responsable !== undefined && { responsable: data.responsable }),
      ...(data.adresse !== undefined && { adresse: data.adresse }),
      ...(data.telephone !== undefined && { telephone: data.telephone }),
      ...(data.horaires !== undefined && { horaires: data.horaires }),
      ...(data.latitude !== undefined && { latitude: data.latitude }),
      ...(data.longitude !== undefined && { longitude: data.longitude }),
      ...(data.statutPublication !== undefined && { statutPublication: data.statutPublication }),
      ...(data.ordre !== undefined && { ordre: data.ordre }),
      ...(data.traductions && {
        traductions: {
          upsert: data.traductions.map((t) => ({
            where: { municipalServiceId_locale: { municipalServiceId: id, locale: t.locale } },
            create: { locale: t.locale, presentation: t.presentation },
            update: { presentation: t.presentation },
          })),
        },
      }),
    },
    include: includePourAffichage,
  });
}

export async function remove(id: string) {
  const existing = await prisma.municipalService.findUnique({ where: { id } });
  if (!existing) throw new AppError(404, 'Service introuvable');
  await prisma.municipalService.delete({ where: { id } });
}
