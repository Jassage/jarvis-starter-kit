import { Locale, StatutPublication, TypeEcole } from '@prisma/client';
import prisma from '../../config/database';
import { AppError } from '../../types';

interface TraductionInput {
  locale: Locale;
  description: string;
}

interface SchoolInput {
  nom: string;
  type: TypeEcole;
  directeur?: string;
  adresse?: string;
  telephone?: string;
  email?: string;
  nombreEleves?: number;
  statutPublication: StatutPublication;
  photoId?: string;
  ordre: number;
  traductions: TraductionInput[];
}

const includePourAffichage = { traductions: true, photo: true };
const orderByDefaut = { ordre: 'asc' as const };

export async function listPublique(type?: TypeEcole) {
  return prisma.school.findMany({
    where: { statutPublication: 'PUBLIE', ...(type && { type }) },
    orderBy: orderByDefaut,
    include: includePourAffichage,
  });
}

export async function listAdmin() {
  return prisma.school.findMany({ orderBy: orderByDefaut, include: includePourAffichage });
}

export async function create(data: SchoolInput) {
  return prisma.school.create({
    data: {
      nom: data.nom,
      type: data.type,
      directeur: data.directeur,
      adresse: data.adresse,
      telephone: data.telephone,
      email: data.email,
      nombreEleves: data.nombreEleves,
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
  data: Partial<Omit<SchoolInput, 'traductions'>> & { traductions?: TraductionInput[] }
) {
  const existing = await prisma.school.findUnique({ where: { id } });
  if (!existing) throw new AppError(404, 'Établissement introuvable');

  return prisma.school.update({
    where: { id },
    data: {
      ...(data.nom !== undefined && { nom: data.nom }),
      ...(data.type !== undefined && { type: data.type }),
      ...(data.directeur !== undefined && { directeur: data.directeur }),
      ...(data.adresse !== undefined && { adresse: data.adresse }),
      ...(data.telephone !== undefined && { telephone: data.telephone }),
      ...(data.email !== undefined && { email: data.email }),
      ...(data.nombreEleves !== undefined && { nombreEleves: data.nombreEleves }),
      ...(data.statutPublication !== undefined && { statutPublication: data.statutPublication }),
      ...(data.photoId !== undefined && { photoId: data.photoId }),
      ...(data.ordre !== undefined && { ordre: data.ordre }),
      ...(data.traductions && {
        traductions: {
          upsert: data.traductions.map((t) => ({
            where: { schoolId_locale: { schoolId: id, locale: t.locale } },
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
  const existing = await prisma.school.findUnique({ where: { id } });
  if (!existing) throw new AppError(404, 'Établissement introuvable');
  await prisma.school.delete({ where: { id } });
}
