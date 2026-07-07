import prisma from '../../config/database';
import { AppError } from '../../types';

export async function getPublicBoutique(slug: string) {
  const boutique = await prisma.boutique.findUnique({
    where: { slug },
    select: {
      id: true,
      name: true,
      slug: true,
      status: true,
      logoUrl: true,
      themeColor: true,
      description: true,
      contactEmail: true,
      contactPhone: true,
      department: true,
      commune: true,
    },
  });
  if (!boutique || boutique.status !== 'ACTIVE') throw new AppError('Boutique introuvable', 404);
  return boutique;
}

async function resolveActiveBoutiqueId(slug: string): Promise<string> {
  const boutique = await prisma.boutique.findUnique({ where: { slug }, select: { id: true, status: true } });
  if (!boutique || boutique.status !== 'ACTIVE') throw new AppError('Boutique introuvable', 404);
  return boutique.id;
}

export async function listPublicProducts(slug: string, filters: { categoryId?: string; q?: string } = {}) {
  const boutiqueId = await resolveActiveBoutiqueId(slug);
  return prisma.product.findMany({
    where: {
      boutiqueId,
      status: 'ACTIVE',
      ...(filters.categoryId ? { categoryId: filters.categoryId } : {}),
      ...(filters.q ? { name: { contains: filters.q, mode: 'insensitive' } } : {}),
    },
    include: { images: { orderBy: { order: 'asc' }, take: 1 }, category: true },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getPublicProduct(slug: string, productSlug: string) {
  const boutiqueId = await resolveActiveBoutiqueId(slug);
  const product = await prisma.product.findUnique({
    where: { boutiqueId_slug: { boutiqueId, slug: productSlug } },
    include: { images: { orderBy: { order: 'asc' } }, variants: true, category: true },
  });
  if (!product || product.status !== 'ACTIVE') throw new AppError('Produit introuvable', 404);
  return product;
}

export async function listPublicCategories(slug: string) {
  const boutiqueId = await resolveActiveBoutiqueId(slug);
  return prisma.category.findMany({ where: { boutiqueId }, orderBy: { name: 'asc' } });
}
