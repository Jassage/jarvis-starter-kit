import prisma from '../../config/database';
import { AppError } from '../../types';
import * as notificationsService from '../notifications/notifications.service';

async function resolveActiveBoutique(slug: string) {
  const boutique = await prisma.boutique.findUnique({ where: { slug }, select: { id: true, status: true } });
  if (!boutique || boutique.status !== 'ACTIVE') throw new AppError('Boutique introuvable', 404);
  return boutique;
}

async function generateOrderNumber(): Promise<string> {
  // Code court global (pas de compteur par boutique : évite un point de contention en écriture
  // dès la première session, cf. décision documentée dans le plan d'implémentation).
  const random = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `SHP-${Date.now().toString(36).toUpperCase()}${random}`;
}

interface CheckoutInput {
  buyerName: string;
  buyerEmail: string;
  buyerPhone: string;
  department?: string;
  commune?: string;
  landmark?: string;
  shippingFee: number;
}

export async function checkout(slug: string, sessionId: string, input: CheckoutInput) {
  const boutique = await resolveActiveBoutique(slug);
  const cart = await prisma.cart.findFirst({
    where: { boutiqueId: boutique.id, sessionId },
    include: { items: { include: { product: true, variant: true } } },
  });
  if (!cart || cart.items.length === 0) throw new AppError('Le panier est vide', 400);

  // Vérification de stock avant paiement : évite qu'un client paie pour un article déjà épuisé.
  // Soft check (pas de réservation) : le stock n'est réellement décrémenté qu'à l'activation du
  // paiement (voir payments.service.ts::activateOrder), avec une garde atomique compare-and-swap
  // qui reste la véritable protection contre la survente en cas de paiements concurrents.
  for (const item of cart.items) {
    if (!item.product.trackStock) continue;
    const available = item.variant ? item.variant.stockQty : item.product.stockQty;
    if (available < item.quantity) {
      throw new AppError(`Stock insuffisant pour "${item.product.name}" (${available} disponible(s))`, 409);
    }
  }

  // Checkout invité : upsert d'une fiche Customer par email pour l'historique, sans mot de passe requis.
  const customer = await prisma.customer.upsert({
    where: { boutiqueId_email: { boutiqueId: boutique.id, email: input.buyerEmail } },
    create: {
      boutiqueId: boutique.id,
      email: input.buyerEmail,
      firstName: input.buyerName,
      phone: input.buyerPhone,
      department: input.department as never,
      commune: input.commune,
      landmark: input.landmark,
    },
    update: {},
  });

  const subtotal = cart.items.reduce((sum, item) => sum + Number(item.unitPrice) * item.quantity, 0);
  const total = subtotal + input.shippingFee;
  const currency = cart.items[0]?.product.currency ?? 'HTG';

  const order = await prisma.$transaction(async (tx) => {
    const created = await tx.order.create({
      data: {
        boutiqueId: boutique.id,
        customerId: customer.id,
        orderNumber: await generateOrderNumber(),
        status: 'PENDING_PAYMENT',
        subtotal,
        shippingFee: input.shippingFee,
        total,
        currency,
        buyerName: input.buyerName,
        buyerEmail: input.buyerEmail,
        buyerPhone: input.buyerPhone,
        department: input.department as never,
        commune: input.commune,
        landmark: input.landmark,
        items: {
          create: cart.items.map((item) => ({
            productId: item.productId,
            variantId: item.variantId,
            productNameSnapshot: item.product.name,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
          })),
        },
      },
      include: { items: true },
    });
    await tx.cartItem.deleteMany({ where: { cartId: cart.id } });
    await notificationsService.createNotification(tx, {
      boutiqueId: boutique.id,
      type: 'ORDER_PLACED',
      title: 'Nouvelle commande',
      message: `Nouvelle commande ${created.orderNumber} (${created.total} ${created.currency}) en attente de paiement.`,
      data: { orderId: created.id },
    });
    return created;
  });

  return order;
}

export async function lookupOrder(slug: string, orderNumber: string, email: string) {
  const boutique = await resolveActiveBoutique(slug);
  const order = await prisma.order.findFirst({
    where: { boutiqueId: boutique.id, orderNumber, buyerEmail: email },
    include: { items: true, payments: { orderBy: { createdAt: 'desc' }, take: 1 } },
  });
  if (!order) throw new AppError('Commande introuvable', 404);
  return order;
}

export async function listOrders(boutiqueId: string, status?: string) {
  return prisma.order.findMany({
    where: { boutiqueId, ...(status ? { status: status as never } : {}) },
    include: { items: true },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getOrder(boutiqueId: string, orderId: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true, payments: { orderBy: { createdAt: 'desc' } }, customer: true },
  });
  if (!order || order.boutiqueId !== boutiqueId) throw new AppError('Commande introuvable', 404);
  return order;
}

const ALLOWED_TRANSITIONS: Record<string, string[]> = {
  PAID: ['PROCESSING', 'CANCELLED'],
  PROCESSING: ['SHIPPED', 'CANCELLED'],
  SHIPPED: ['DELIVERED'],
};

export async function updateOrderStatus(boutiqueId: string, orderId: string, nextStatus: string) {
  const order = await getOrder(boutiqueId, orderId);
  const allowed = ALLOWED_TRANSITIONS[order.status] ?? [];
  if (!allowed.includes(nextStatus)) {
    throw new AppError(`Transition ${order.status} → ${nextStatus} non autorisée`, 400);
  }
  return prisma.order.update({ where: { id: orderId }, data: { status: nextStatus as never } });
}
