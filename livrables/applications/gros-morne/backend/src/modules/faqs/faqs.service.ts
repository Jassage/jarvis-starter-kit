import { CategorieFaq, Locale, StatutPublication } from '@prisma/client';
import prisma from '../../config/database';
import { AppError } from '../../types';

interface TraductionInput {
  locale: Locale;
  question: string;
  reponse: string;
}

interface FaqInput {
  categorie: CategorieFaq;
  statutPublication: StatutPublication;
  ordre: number;
  traductions: TraductionInput[];
}

export async function listPublique(categorie?: CategorieFaq) {
  return prisma.faq.findMany({
    where: {
      statutPublication: 'PUBLIE',
      ...(categorie && { categorie }),
    },
    orderBy: { ordre: 'asc' },
    include: { traductions: true },
  });
}

export async function listAdmin() {
  return prisma.faq.findMany({
    orderBy: { ordre: 'asc' },
    include: { traductions: true },
  });
}

export async function create(data: FaqInput) {
  return prisma.faq.create({
    data: {
      categorie: data.categorie,
      statutPublication: data.statutPublication,
      ordre: data.ordre,
      traductions: {
        create: data.traductions.map((t) => ({ locale: t.locale, question: t.question, reponse: t.reponse })),
      },
    },
    include: { traductions: true },
  });
}

export async function update(
  id: string,
  data: Partial<Omit<FaqInput, 'traductions'>> & { traductions?: TraductionInput[] }
) {
  const existing = await prisma.faq.findUnique({ where: { id } });
  if (!existing) throw new AppError(404, 'Question introuvable');

  return prisma.faq.update({
    where: { id },
    data: {
      ...(data.categorie !== undefined && { categorie: data.categorie }),
      ...(data.statutPublication !== undefined && { statutPublication: data.statutPublication }),
      ...(data.ordre !== undefined && { ordre: data.ordre }),
      ...(data.traductions && {
        traductions: {
          upsert: data.traductions.map((t) => ({
            where: { faqId_locale: { faqId: id, locale: t.locale } },
            create: { locale: t.locale, question: t.question, reponse: t.reponse },
            update: { question: t.question, reponse: t.reponse },
          })),
        },
      }),
    },
    include: { traductions: true },
  });
}

export async function remove(id: string) {
  const existing = await prisma.faq.findUnique({ where: { id } });
  if (!existing) throw new AppError(404, 'Question introuvable');
  await prisma.faq.delete({ where: { id } });
}
