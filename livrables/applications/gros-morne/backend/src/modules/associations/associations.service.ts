import { Locale, StatutPublication } from '@prisma/client';
import prisma from '../../config/database';
import { AppError } from '../../types';

interface TraductionInput {
  locale: Locale;
  mission: string;
}

interface AssociationInput {
  nom: string;
  president?: string;
  domainesAction: string[];
  adresse?: string;
  telephone?: string;
  email?: string;
  statutPublication: StatutPublication;
  photoId?: string;
  ordre: number;
  traductions: TraductionInput[];
}

const includePourAffichage = { traductions: true, photo: true };
const orderByDefaut = { ordre: 'asc' as const };

export async function listPublique() {
  return prisma.association.findMany({ where: { statutPublication: 'PUBLIE' }, orderBy: orderByDefaut, include: includePourAffichage });
}

export async function listAdmin() {
  return prisma.association.findMany({ orderBy: orderByDefaut, include: includePourAffichage });
}

export async function create(data: AssociationInput) {
  return prisma.association.create({
    data: {
      nom: data.nom,
      president: data.president,
      domainesAction: data.domainesAction,
      adresse: data.adresse,
      telephone: data.telephone,
      email: data.email,
      statutPublication: data.statutPublication,
      photoId: data.photoId,
      ordre: data.ordre,
      traductions: { create: data.traductions.map((t) => ({ locale: t.locale, mission: t.mission })) },
    },
    include: includePourAffichage,
  });
}

export async function update(
  id: string,
  data: Partial<Omit<AssociationInput, 'traductions'>> & { traductions?: TraductionInput[] }
) {
  const existing = await prisma.association.findUnique({ where: { id } });
  if (!existing) throw new AppError(404, 'Association introuvable');

  return prisma.association.update({
    where: { id },
    data: {
      ...(data.nom !== undefined && { nom: data.nom }),
      ...(data.president !== undefined && { president: data.president }),
      ...(data.domainesAction !== undefined && { domainesAction: data.domainesAction }),
      ...(data.adresse !== undefined && { adresse: data.adresse }),
      ...(data.telephone !== undefined && { telephone: data.telephone }),
      ...(data.email !== undefined && { email: data.email }),
      ...(data.statutPublication !== undefined && { statutPublication: data.statutPublication }),
      ...(data.photoId !== undefined && { photoId: data.photoId }),
      ...(data.ordre !== undefined && { ordre: data.ordre }),
      ...(data.traductions && {
        traductions: {
          upsert: data.traductions.map((t) => ({
            where: { associationId_locale: { associationId: id, locale: t.locale } },
            create: { locale: t.locale, mission: t.mission },
            update: { mission: t.mission },
          })),
        },
      }),
    },
    include: includePourAffichage,
  });
}

export async function remove(id: string) {
  const existing = await prisma.association.findUnique({ where: { id } });
  if (!existing) throw new AppError(404, 'Association introuvable');
  await prisma.association.delete({ where: { id } });
}
