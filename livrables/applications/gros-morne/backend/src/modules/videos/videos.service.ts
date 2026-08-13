import { CategorieGalerie, Locale, StatutPublication } from '@prisma/client';
import prisma from '../../config/database';
import { AppError } from '../../types';

interface TraductionInput {
  locale: Locale;
  description: string;
}

interface VideoInput {
  titre: string;
  url: string;
  categorie: CategorieGalerie;
  miseEnAvant: boolean;
  statutPublication: StatutPublication;
  miniatureId?: string;
  ordre: number;
  traductions: TraductionInput[];
}

const includePourAffichage = {
  traductions: true,
  miniature: true,
};

export async function listPublique(categorie?: CategorieGalerie) {
  return prisma.video.findMany({
    where: { statutPublication: 'PUBLIE', ...(categorie && { categorie }) },
    orderBy: [{ miseEnAvant: 'desc' as const }, { ordre: 'asc' as const }],
    include: includePourAffichage,
  });
}

export async function listAdmin() {
  return prisma.video.findMany({
    orderBy: [{ miseEnAvant: 'desc' as const }, { ordre: 'asc' as const }],
    include: includePourAffichage,
  });
}

export async function create(data: VideoInput) {
  return prisma.video.create({
    data: {
      titre: data.titre,
      url: data.url,
      categorie: data.categorie,
      miseEnAvant: data.miseEnAvant,
      statutPublication: data.statutPublication,
      miniatureId: data.miniatureId,
      ordre: data.ordre,
      traductions: { create: data.traductions.map((t) => ({ locale: t.locale, description: t.description })) },
    },
    include: includePourAffichage,
  });
}

export async function update(
  id: string,
  data: Partial<Omit<VideoInput, 'traductions'>> & { traductions?: TraductionInput[] }
) {
  const existing = await prisma.video.findUnique({ where: { id } });
  if (!existing) throw new AppError(404, 'Vidéo introuvable');

  return prisma.video.update({
    where: { id },
    data: {
      ...(data.titre !== undefined && { titre: data.titre }),
      ...(data.url !== undefined && { url: data.url }),
      ...(data.categorie !== undefined && { categorie: data.categorie }),
      ...(data.miseEnAvant !== undefined && { miseEnAvant: data.miseEnAvant }),
      ...(data.statutPublication !== undefined && { statutPublication: data.statutPublication }),
      ...(data.miniatureId !== undefined && { miniatureId: data.miniatureId }),
      ...(data.ordre !== undefined && { ordre: data.ordre }),
      ...(data.traductions && {
        traductions: {
          upsert: data.traductions.map((t) => ({
            where: { videoId_locale: { videoId: id, locale: t.locale } },
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
  const existing = await prisma.video.findUnique({ where: { id } });
  if (!existing) throw new AppError(404, 'Vidéo introuvable');
  await prisma.video.delete({ where: { id } });
}
