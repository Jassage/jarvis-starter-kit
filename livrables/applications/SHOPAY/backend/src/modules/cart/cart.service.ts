import prisma from '../../config/database';
import { AppError } from '../../types';

async function resolveActiveBoutique(slug: string) {
  const boutique = await prisma.boutique.findUnique({ where: { slug }, select: { id: true, status: true } });
  if (!boutique || boutique.status !== 'ACTIVE') throw new AppError('Boutique introuvable', 404);
  return boutique;
}

async function getOrCreateCart(boutiqueId: string, sessionId: string) {
  let cart = await prisma.cart.findFirst({ where: { boutiqueId, sessionId } });
  if (!cart) {
    cart = await prisma.cart.create({ data: { boutiqueId, sessionId } });
  }
  return cart;
}

function withComputedTotals(cart: { items: { quantity: number; unitPrice: unknown }[] }) {
  const subtotal = cart.items.reduce((sum, item) => sum + Number(item.unitPrice) * item.quantity, 0);
  return { ...cart, subtotal };
}

export async function getCart(slug: string, sessionId: string) {
  const boutique = await resolveActiveBoutique(slug);
  const cart = await getOrCreateCart(boutique.id, sessionId);
  const full = await prisma.cart.findUnique({
    where: { id: cart.id },
    include: { items: { include: { product: { include: { images: { take: 1, orderBy: { order: 'asc' } } } }, variant: true } } },
  });
  return withComputedTotals(full!);
}

export async function addItem(slug: string, sessionId: string, productId: string, variantId: string | undefined, quantity: number) {
  const boutique = await resolveActiveBoutique(slug);
  const product = await prisma.product.findUnique({ where: { id: productId }, include: { variants: true } });
  if (!product || product.boutiqueId !== boutique.id || product.status !== 'ACTIVE') {
    throw new AppError('Produit introuvable', 404);
  }

  let unitPrice = Number(product.basePrice);
  if (variantId) {
    const variant = product.variants.find((v) => v.id === variantId);
    if (!variant) throw new AppError('Variante introuvable', 404);
    unitPrice = variant.priceOverride ? Number(variant.priceOverride) : unitPrice;
  }

  const cart = await getOrCreateCart(boutique.id, sessionId);
  const existing = await prisma.cartItem.findFirst({ where: { cartId: cart.id, productId, variantId: variantId ?? null } });

  if (existing) {
    await prisma.cartItem.update({ where: { id: existing.id }, data: { quantity: existing.quantity + quantity } });
  } else {
    await prisma.cartItem.create({ data: { cartId: cart.id, productId, variantId, quantity, unitPrice } });
  }

  return getCart(slug, sessionId);
}

export async function updateItem(slug: string, sessionId: string, itemId: string, quantity: number) {
  const boutique = await resolveActiveBoutique(slug);
  const cart = await getOrCreateCart(boutique.id, sessionId);
  const item = await prisma.cartItem.findUnique({ where: { id: itemId } });
  if (!item || item.cartId !== cart.id) throw new AppError('Article introuvable', 404);

  if (quantity <= 0) {
    await prisma.cartItem.delete({ where: { id: itemId } });
  } else {
    await prisma.cartItem.update({ where: { id: itemId }, data: { quantity } });
  }
  return getCart(slug, sessionId);
}

export async function removeItem(slug: string, sessionId: string, itemId: string) {
  const boutique = await resolveActiveBoutique(slug);
  const cart = await getOrCreateCart(boutique.id, sessionId);
  const item = await prisma.cartItem.findUnique({ where: { id: itemId } });
  if (!item || item.cartId !== cart.id) throw new AppError('Article introuvable', 404);
  await prisma.cartItem.delete({ where: { id: itemId } });
  return getCart(slug, sessionId);
}
