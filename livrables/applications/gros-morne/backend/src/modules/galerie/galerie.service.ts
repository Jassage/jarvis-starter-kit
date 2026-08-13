import { CategorieGalerie, Locale, StatutPublication } from '@prisma/client';
import prisma from '../../config/database';
import { AppError } from '../../types';

interface TraductionInput {
  locale: Locale;
  description: string;
}

interface MediaItemInput {
  mediaId?: string;
  icone?: string;
  titre: string;
  auteur?: string;
  lieu?: string;
  ordre: number;
}

interface AlbumInput {
  nom: string;
  categorie: CategorieGalerie;
  statutPublication: StatutPublication;
  photoCouvertureId?: string;
  ordre: number;
  traductions: TraductionInput[];
  medias: MediaItemInput[];
}

const includePourAffichage = {
  traductions: true,
  photoCouverture: true,
  medias: { include: { media: true }, orderBy: { ordre: 'asc' as const } },
};

export async function listPublique(categorie?: CategorieGalerie) {
  return prisma.galerieAlbum.findMany({
    where: { statutPublication: 'PUBLIE', ...(categorie && { categorie }) },
    orderBy: { ordre: 'asc' },
    include: includePourAffichage,
  });
}

export async function listAdmin() {
  return prisma.galerieAlbum.findMany({
    orderBy: { ordre: 'asc' },
    include: includePourAffichage,
  });
}

export async function create(data: AlbumInput) {
  return prisma.galerieAlbum.create({
    data: {
      nom: data.nom,
      categorie: data.categorie,
      statutPublication: data.statutPublication,
      photoCouvertureId: data.photoCouvertureId,
      ordre: data.ordre,
      traductions: { create: data.traductions.map((t) => ({ locale: t.locale, description: t.description })) },
      medias: {
        create: data.medias.map((m) => ({
          mediaId: m.mediaId,
          icone: m.icone,
          titre: m.titre,
          auteur: m.auteur,
          lieu: m.lieu,
          ordre: m.ordre,
        })),
      },
    },
    include: includePourAffichage,
  });
}

export async function update(
  id: string,
  data: Partial<Omit<AlbumInput, 'traductions' | 'medias'>> & {
    traductions?: TraductionInput[];
    medias?: MediaItemInput[];
  }
) {
  const existing = await prisma.galerieAlbum.findUnique({ where: { id } });
  if (!existing) throw new AppError(404, 'Album introuvable');

  return prisma.galerieAlbum.update({
    where: { id },
    data: {
      ...(data.nom !== undefined && { nom: data.nom }),
      ...(data.categorie !== undefined && { categorie: data.categorie }),
      ...(data.statutPublication !== undefined && { statutPublication: data.statutPublication }),
      ...(data.photoCouvertureId !== undefined && { photoCouvertureId: data.photoCouvertureId }),
      ...(data.ordre !== undefined && { ordre: data.ordre }),
      ...(data.traductions && {
        traductions: {
          upsert: data.traductions.map((t) => ({
            where: { albumId_locale: { albumId: id, locale: t.locale } },
            create: { locale: t.locale, description: t.description },
            update: { description: t.description },
          })),
        },
      }),
      ...(data.medias && {
        medias: {
          deleteMany: {},
          create: data.medias.map((m) => ({
            mediaId: m.mediaId,
            icone: m.icone,
            titre: m.titre,
            auteur: m.auteur,
            lieu: m.lieu,
            ordre: m.ordre,
          })),
        },
      }),
    },
    include: includePourAffichage,
  });
}

export async function remove(id: string) {
  const existing = await prisma.galerieAlbum.findUnique({ where: { id } });
  if (!existing) throw new AppError(404, 'Album introuvable');
  await prisma.galerieAlbum.delete({ where: { id } });
}
