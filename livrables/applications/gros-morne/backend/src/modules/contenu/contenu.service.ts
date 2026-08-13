import { Locale } from '@prisma/client';
import prisma from '../../config/database';
import { AppError } from '../../types';

interface TraductionInput {
  locale: Locale;
  titre?: string;
  contenu: string;
}

export async function listByPage(page: string) {
  return prisma.pageSection.findMany({
    where: { page },
    orderBy: { ordre: 'asc' },
    include: { traductions: true },
  });
}

export async function create(data: { page: string; cle: string; ordre: number; traductions: TraductionInput[] }) {
  return prisma.pageSection.create({
    data: {
      page: data.page,
      cle: data.cle,
      ordre: data.ordre,
      traductions: {
        create: data.traductions.map((t) => ({
          locale: t.locale,
          titre: t.titre,
          contenu: t.contenu,
        })),
      },
    },
    include: { traductions: true },
  });
}

export async function update(
  id: string,
  data: { ordre?: number; traductions?: TraductionInput[] }
) {
  const existing = await prisma.pageSection.findUnique({ where: { id } });
  if (!existing) throw new AppError(404, 'Bloc de contenu introuvable');

  return prisma.pageSection.update({
    where: { id },
    data: {
      ...(data.ordre !== undefined && { ordre: data.ordre }),
      ...(data.traductions && {
        traductions: {
          upsert: data.traductions.map((t) => ({
            where: { pageSectionId_locale: { pageSectionId: id, locale: t.locale } },
            create: { locale: t.locale, titre: t.titre, contenu: t.contenu },
            update: { titre: t.titre, contenu: t.contenu },
          })),
        },
      }),
    },
    include: { traductions: true },
  });
}

export async function remove(id: string) {
  const existing = await prisma.pageSection.findUnique({ where: { id } });
  if (!existing) throw new AppError(404, 'Bloc de contenu introuvable');
  await prisma.pageSection.delete({ where: { id } });
}
