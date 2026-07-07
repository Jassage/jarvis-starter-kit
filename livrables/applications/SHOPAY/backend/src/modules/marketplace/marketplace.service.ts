import prisma from '../../config/database';
import { Department } from '@prisma/client';

interface MarketplaceProductFilters {
  q?: string;
  department?: Department;
  page?: number;
  limit?: number;
}

// Découverte cross-boutiques : contrairement à storefront.service.ts (scopé à une boutique),
// ici on liste les produits de TOUTES les boutiques actives, façon marketplace. Le panier/checkout
// restent scopés par boutique (voir cart/orders) : cliquer un produit renvoie vers sa boutique.
export async function listMarketplaceProducts(filters: MarketplaceProductFilters = {}) {
  const page = Math.max(1, filters.page ?? 1);
  const limit = Math.min(50, Math.max(1, filters.limit ?? 24));

  const where = {
    status: 'ACTIVE' as const,
    boutique: {
      status: 'ACTIVE' as const,
      ...(filters.department ? { department: filters.department } : {}),
    },
    ...(filters.q ? { name: { contains: filters.q, mode: 'insensitive' as const } } : {}),
  };

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: {
        images: { orderBy: { order: 'asc' }, take: 1 },
        boutique: { select: { name: true, slug: true, logoUrl: true, department: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.product.count({ where }),
  ]);

  return { products, total, page, limit, totalPages: Math.max(1, Math.ceil(total / limit)) };
}

export async function listMarketplaceBoutiques() {
  return prisma.boutique.findMany({
    where: { status: 'ACTIVE' },
    select: {
      id: true,
      name: true,
      slug: true,
      logoUrl: true,
      themeColor: true,
      description: true,
      department: true,
      commune: true,
      _count: { select: { products: { where: { status: 'ACTIVE' } } } },
    },
    orderBy: { name: 'asc' },
  });
}
