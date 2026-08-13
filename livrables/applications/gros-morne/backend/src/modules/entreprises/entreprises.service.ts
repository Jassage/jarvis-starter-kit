import { CategorieEconomique, Locale, StatutPublication } from '@prisma/client';
import prisma from '../../config/database';
import { AppError } from '../../types';

interface TraductionInput {
  locale: Locale;
  description: string;
}

interface BusinessInput {
  nom: string;
  categorie: CategorieEconomique;
  adresse?: string;
  telephone?: string;
  email?: string;
  siteWeb?: string;
  latitude?: number;
  longitude?: number;
  statutPublication: StatutPublication;
  photoId?: string;
  ordre: number;
  traductions: TraductionInput[];
}

const includePourAffichage = { traductions: true, photo: true };
const orderByDefaut = { ordre: 'asc' as const };

export async function listPublique(categorie?: CategorieEconomique) {
  return prisma.business.findMany({
    where: { statutPublication: 'PUBLIE', ...(categorie && { categorie }) },
    orderBy: orderByDefaut,
    include: includePourAffichage,
  });
}

export async function listAdmin() {
  return prisma.business.findMany({ orderBy: orderByDefaut, include: includePourAffichage });
}

export async function create(data: BusinessInput) {
  return prisma.business.create({
    data: {
      nom: data.nom,
      categorie: data.categorie,
      adresse: data.adresse,
      telephone: data.telephone,
      email: data.email,
      siteWeb: data.siteWeb,
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
  data: Partial<Omit<BusinessInput, 'traductions'>> & { traductions?: TraductionInput[] }
) {
  const existing = await prisma.business.findUnique({ where: { id } });
  if (!existing) throw new AppError(404, 'Entreprise introuvable');

  return prisma.business.update({
    where: { id },
    data: {
      ...(data.nom !== undefined && { nom: data.nom }),
      ...(data.categorie !== undefined && { categorie: data.categorie }),
      ...(data.adresse !== undefined && { adresse: data.adresse }),
      ...(data.telephone !== undefined && { telephone: data.telephone }),
      ...(data.email !== undefined && { email: data.email }),
      ...(data.siteWeb !== undefined && { siteWeb: data.siteWeb }),
      ...(data.latitude !== undefined && { latitude: data.latitude }),
      ...(data.longitude !== undefined && { longitude: data.longitude }),
      ...(data.statutPublication !== undefined && { statutPublication: data.statutPublication }),
      ...(data.photoId !== undefined && { photoId: data.photoId }),
      ...(data.ordre !== undefined && { ordre: data.ordre }),
      ...(data.traductions && {
        traductions: {
          upsert: data.traductions.map((t) => ({
            where: { businessId_locale: { businessId: id, locale: t.locale } },
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
  const existing = await prisma.business.findUnique({ where: { id } });
  if (!existing) throw new AppError(404, 'Entreprise introuvable');
  await prisma.business.delete({ where: { id } });
}
