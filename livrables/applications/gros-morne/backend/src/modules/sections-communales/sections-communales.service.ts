import { Locale } from '@prisma/client';
import prisma from '../../config/database';
import { AppError } from '../../types';

interface TraductionInput {
  locale: Locale;
  description: string;
  activitesPrincipales: string[];
}

interface SectionCommunaleInput {
  nom: string;
  principale: boolean;
  couleur: string;
  population?: number;
  photoUrl?: string;
  ordre: number;
  traductions: TraductionInput[];
}

export async function list() {
  return prisma.sectionCommunale.findMany({
    orderBy: { ordre: 'asc' },
    include: { traductions: true },
  });
}

export async function create(data: SectionCommunaleInput) {
  return prisma.sectionCommunale.create({
    data: {
      nom: data.nom,
      principale: data.principale,
      couleur: data.couleur,
      population: data.population,
      photoUrl: data.photoUrl,
      ordre: data.ordre,
      traductions: {
        create: data.traductions.map((t) => ({
          locale: t.locale,
          description: t.description,
          activitesPrincipales: t.activitesPrincipales,
        })),
      },
    },
    include: { traductions: true },
  });
}

export async function update(
  id: string,
  data: Partial<Omit<SectionCommunaleInput, 'traductions'>> & { traductions?: TraductionInput[] }
) {
  const existing = await prisma.sectionCommunale.findUnique({ where: { id } });
  if (!existing) throw new AppError(404, 'Section communale introuvable');

  return prisma.sectionCommunale.update({
    where: { id },
    data: {
      ...(data.nom !== undefined && { nom: data.nom }),
      ...(data.principale !== undefined && { principale: data.principale }),
      ...(data.couleur !== undefined && { couleur: data.couleur }),
      ...(data.population !== undefined && { population: data.population }),
      ...(data.photoUrl !== undefined && { photoUrl: data.photoUrl }),
      ...(data.ordre !== undefined && { ordre: data.ordre }),
      ...(data.traductions && {
        traductions: {
          upsert: data.traductions.map((t) => ({
            where: { sectionCommunaleId_locale: { sectionCommunaleId: id, locale: t.locale } },
            create: { locale: t.locale, description: t.description, activitesPrincipales: t.activitesPrincipales },
            update: { description: t.description, activitesPrincipales: t.activitesPrincipales },
          })),
        },
      }),
    },
    include: { traductions: true },
  });
}

export async function remove(id: string) {
  const existing = await prisma.sectionCommunale.findUnique({ where: { id } });
  if (!existing) throw new AppError(404, 'Section communale introuvable');
  await prisma.sectionCommunale.delete({ where: { id } });
}
