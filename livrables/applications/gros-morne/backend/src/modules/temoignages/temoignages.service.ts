import { Locale, StatutPublication } from '@prisma/client';
import prisma from '../../config/database';
import { AppError } from '../../types';

interface TraductionInput {
  locale: Locale;
  contenu: string;
}

interface TemoignageInput {
  nom: string;
  fonction?: string;
  photoId?: string;
  note?: number;
  statutPublication: StatutPublication;
  ordre: number;
  traductions: TraductionInput[];
}

const includePourAffichage = {
  traductions: true,
  photo: true,
};

export async function listPublique() {
  return prisma.temoignage.findMany({
    where: { statutPublication: 'PUBLIE' },
    orderBy: { ordre: 'asc' },
    include: includePourAffichage,
  });
}

export async function listAdmin() {
  return prisma.temoignage.findMany({
    orderBy: { ordre: 'asc' },
    include: includePourAffichage,
  });
}

export async function create(data: TemoignageInput) {
  return prisma.temoignage.create({
    data: {
      nom: data.nom,
      fonction: data.fonction,
      photoId: data.photoId,
      note: data.note,
      statutPublication: data.statutPublication,
      ordre: data.ordre,
      traductions: {
        create: data.traductions.map((t) => ({ locale: t.locale, contenu: t.contenu })),
      },
    },
    include: includePourAffichage,
  });
}

export async function update(
  id: string,
  data: Partial<Omit<TemoignageInput, 'traductions'>> & { traductions?: TraductionInput[] }
) {
  const existing = await prisma.temoignage.findUnique({ where: { id } });
  if (!existing) throw new AppError(404, 'Témoignage introuvable');

  return prisma.temoignage.update({
    where: { id },
    data: {
      ...(data.nom !== undefined && { nom: data.nom }),
      ...(data.fonction !== undefined && { fonction: data.fonction }),
      ...(data.photoId !== undefined && { photoId: data.photoId }),
      ...(data.note !== undefined && { note: data.note }),
      ...(data.statutPublication !== undefined && { statutPublication: data.statutPublication }),
      ...(data.ordre !== undefined && { ordre: data.ordre }),
      ...(data.traductions && {
        traductions: {
          upsert: data.traductions.map((t) => ({
            where: { temoignageId_locale: { temoignageId: id, locale: t.locale } },
            create: { locale: t.locale, contenu: t.contenu },
            update: { contenu: t.contenu },
          })),
        },
      }),
    },
    include: includePourAffichage,
  });
}

export async function remove(id: string) {
  const existing = await prisma.temoignage.findUnique({ where: { id } });
  if (!existing) throw new AppError(404, 'Témoignage introuvable');
  await prisma.temoignage.delete({ where: { id } });
}
