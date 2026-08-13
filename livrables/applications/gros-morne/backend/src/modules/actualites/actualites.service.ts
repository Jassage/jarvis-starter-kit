import { CategorieArticle, Locale, StatutPublication } from '@prisma/client';
import prisma from '../../config/database';
import { AppError } from '../../types';

interface TraductionInput {
  locale: Locale;
  resume: string;
  contenu?: string;
}

interface ArticleInput {
  titre: string;
  auteur?: string;
  categorie: CategorieArticle;
  tags: string[];
  datePublication: Date;
  statutPublication: StatutPublication;
  imagePrincipaleId?: string;
  ordre: number;
  traductions: TraductionInput[];
}

const includePourAffichage = {
  traductions: true,
  imagePrincipale: true,
};

const orderByDefaut = [{ ordre: 'asc' as const }, { datePublication: 'desc' as const }];

export async function listPublique(categorie?: CategorieArticle, q?: string) {
  return prisma.article.findMany({
    where: {
      statutPublication: 'PUBLIE',
      ...(categorie && { categorie }),
      ...(q && {
        OR: [
          { titre: { contains: q, mode: 'insensitive' } },
          { traductions: { some: { resume: { contains: q, mode: 'insensitive' } } } },
          { traductions: { some: { contenu: { contains: q, mode: 'insensitive' } } } },
        ],
      }),
    },
    orderBy: orderByDefaut,
    include: includePourAffichage,
  });
}

export async function listAdmin() {
  return prisma.article.findMany({
    orderBy: orderByDefaut,
    include: includePourAffichage,
  });
}

export async function getByIdPublique(id: string) {
  const article = await prisma.article.findUnique({
    where: { id },
    include: includePourAffichage,
  });
  if (!article || article.statutPublication !== 'PUBLIE') throw new AppError(404, 'Article introuvable');
  return article;
}

export async function create(data: ArticleInput) {
  return prisma.article.create({
    data: {
      titre: data.titre,
      auteur: data.auteur,
      categorie: data.categorie,
      tags: data.tags,
      datePublication: data.datePublication,
      statutPublication: data.statutPublication,
      imagePrincipaleId: data.imagePrincipaleId,
      ordre: data.ordre,
      traductions: {
        create: data.traductions.map((t) => ({
          locale: t.locale,
          resume: t.resume,
          contenu: t.contenu,
        })),
      },
    },
    include: includePourAffichage,
  });
}

export async function update(
  id: string,
  data: Partial<Omit<ArticleInput, 'traductions'>> & { traductions?: TraductionInput[] }
) {
  const existing = await prisma.article.findUnique({ where: { id } });
  if (!existing) throw new AppError(404, 'Article introuvable');

  return prisma.article.update({
    where: { id },
    data: {
      ...(data.titre !== undefined && { titre: data.titre }),
      ...(data.auteur !== undefined && { auteur: data.auteur }),
      ...(data.categorie !== undefined && { categorie: data.categorie }),
      ...(data.tags !== undefined && { tags: data.tags }),
      ...(data.datePublication !== undefined && { datePublication: data.datePublication }),
      ...(data.statutPublication !== undefined && { statutPublication: data.statutPublication }),
      ...(data.imagePrincipaleId !== undefined && { imagePrincipaleId: data.imagePrincipaleId }),
      ...(data.ordre !== undefined && { ordre: data.ordre }),
      ...(data.traductions && {
        traductions: {
          upsert: data.traductions.map((t) => ({
            where: { articleId_locale: { articleId: id, locale: t.locale } },
            create: { locale: t.locale, resume: t.resume, contenu: t.contenu },
            update: { resume: t.resume, contenu: t.contenu },
          })),
        },
      }),
    },
    include: includePourAffichage,
  });
}

export async function remove(id: string) {
  const existing = await prisma.article.findUnique({ where: { id } });
  if (!existing) throw new AppError(404, 'Article introuvable');
  await prisma.article.delete({ where: { id } });
}
