import { Department } from '@prisma/client';
import prisma from '../../config/database';
import { AppError } from '../../types';

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // retire les accents
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60) || 'boutique';
}

export async function uniqueBoutiqueSlug(base: string): Promise<string> {
  let slug = base;
  let suffix = 1;
  while (await prisma.boutique.findUnique({ where: { slug }, select: { id: true } })) {
    suffix += 1;
    slug = `${base}-${suffix}`;
  }
  return slug;
}

export async function isSlugAvailable(slug: string): Promise<boolean> {
  const existing = await prisma.boutique.findUnique({ where: { slug: slugify(slug) }, select: { id: true } });
  return !existing;
}

export async function getMyBoutique(boutiqueId: string) {
  const boutique = await prisma.boutique.findUnique({
    where: { id: boutiqueId },
    include: { merchantSubscription: true },
  });
  if (!boutique) throw new AppError('Boutique introuvable', 404);
  return boutique;
}

export async function updateMyBoutique(
  boutiqueId: string,
  input: Partial<{
    name: string;
    description: string;
    logoUrl: string;
    logoPublicId: string;
    themeColor: string;
    contactEmail: string;
    contactPhone: string;
    department: Department;
    commune: string;
    landmark: string;
  }>
) {
  return prisma.boutique.update({ where: { id: boutiqueId }, data: input });
}
