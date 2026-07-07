import prisma from '../../config/database';
import { AppError } from '../../types';
import { slugify } from '../boutiques/boutiques.service';

export async function listCategories(boutiqueId: string) {
  return prisma.category.findMany({ where: { boutiqueId }, orderBy: { name: 'asc' } });
}

export async function createCategory(boutiqueId: string, name: string) {
  const base = slugify(name);
  let slug = base;
  let suffix = 1;
  while (await prisma.category.findUnique({ where: { boutiqueId_slug: { boutiqueId, slug } } })) {
    suffix += 1;
    slug = `${base}-${suffix}`;
  }
  return prisma.category.create({ data: { boutiqueId, name, slug } });
}

async function assertOwnership(boutiqueId: string, categoryId: string) {
  const category = await prisma.category.findUnique({ where: { id: categoryId } });
  if (!category || category.boutiqueId !== boutiqueId) throw new AppError('Catégorie introuvable', 404);
  return category;
}

export async function updateCategory(boutiqueId: string, categoryId: string, name: string) {
  await assertOwnership(boutiqueId, categoryId);
  return prisma.category.update({ where: { id: categoryId }, data: { name } });
}

export async function deleteCategory(boutiqueId: string, categoryId: string) {
  await assertOwnership(boutiqueId, categoryId);
  await prisma.category.delete({ where: { id: categoryId } });
}
