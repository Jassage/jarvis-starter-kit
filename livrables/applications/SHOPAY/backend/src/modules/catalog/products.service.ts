import prisma from '../../config/database';
import { AppError } from '../../types';
import { slugify } from '../boutiques/boutiques.service';
import { assertProductQuota } from '../billing/quota';

interface VariantInput {
  sku?: string;
  optionsJson: Record<string, string>;
  priceOverride?: number;
  stockQty: number;
  imageUrl?: string;
}

interface CreateProductInput {
  name: string;
  categoryId?: string;
  description?: string;
  basePrice: number;
  currency: string;
  trackStock: boolean;
  stockQty: number;
  status: 'DRAFT' | 'ACTIVE' | 'ARCHIVED';
  variants?: VariantInput[];
}

async function uniqueProductSlug(boutiqueId: string, base: string): Promise<string> {
  let slug = base;
  let suffix = 1;
  while (await prisma.product.findUnique({ where: { boutiqueId_slug: { boutiqueId, slug } } })) {
    suffix += 1;
    slug = `${base}-${suffix}`;
  }
  return slug;
}

export async function listProducts(boutiqueId: string, filters: { status?: string; categoryId?: string } = {}) {
  return prisma.product.findMany({
    where: {
      boutiqueId,
      ...(filters.status ? { status: filters.status as never } : {}),
      ...(filters.categoryId ? { categoryId: filters.categoryId } : {}),
    },
    include: { images: { orderBy: { order: 'asc' } }, variants: true, category: true },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getProduct(boutiqueId: string, productId: string) {
  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: { images: { orderBy: { order: 'asc' } }, variants: true, category: true },
  });
  if (!product || product.boutiqueId !== boutiqueId) throw new AppError('Produit introuvable', 404);
  return product;
}

export async function createProduct(boutiqueId: string, input: CreateProductInput) {
  await assertProductQuota(boutiqueId);
  const slug = await uniqueProductSlug(boutiqueId, slugify(input.name));

  return prisma.product.create({
    data: {
      boutiqueId,
      categoryId: input.categoryId,
      name: input.name,
      slug,
      description: input.description,
      basePrice: input.basePrice,
      currency: input.currency,
      trackStock: input.trackStock,
      stockQty: input.stockQty,
      status: input.status,
      variants: input.variants?.length
        ? {
            create: input.variants.map((v) => ({
              sku: v.sku,
              optionsJson: v.optionsJson,
              priceOverride: v.priceOverride,
              stockQty: v.stockQty,
              imageUrl: v.imageUrl,
            })),
          }
        : undefined,
    },
    include: { images: true, variants: true },
  });
}

export async function updateProduct(boutiqueId: string, productId: string, input: Partial<CreateProductInput>) {
  await getProduct(boutiqueId, productId); // vérifie l'ownership (404 si autre boutique)
  return prisma.product.update({
    where: { id: productId },
    data: {
      name: input.name,
      categoryId: input.categoryId,
      description: input.description,
      basePrice: input.basePrice,
      currency: input.currency,
      trackStock: input.trackStock,
      stockQty: input.stockQty,
      status: input.status,
    },
    include: { images: true, variants: true },
  });
}

export async function deleteProduct(boutiqueId: string, productId: string) {
  await getProduct(boutiqueId, productId);
  await prisma.product.delete({ where: { id: productId } });
}

export async function addProductImage(boutiqueId: string, productId: string, url: string, publicId: string) {
  const product = await getProduct(boutiqueId, productId);
  const count = await prisma.productImage.count({ where: { productId } });
  return prisma.productImage.create({
    data: { productId: product.id, url, publicId, order: count },
  });
}

export async function removeProductImage(boutiqueId: string, productId: string, imageId: string) {
  await getProduct(boutiqueId, productId);
  await prisma.productImage.delete({ where: { id: imageId } });
}
