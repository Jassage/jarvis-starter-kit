import crypto from 'crypto';
import prisma from '../../config/database';
import { AppError } from '../../types';
import { PLAN_LIMITS, SUBSCRIPTION_DURATION_MS } from '../../config/plans';
import { uploadToCloudinary } from '../../config/cloudinary';
import { MerchantPlan, PaymentMethod, PaymentPurpose } from '@prisma/client';

/** Vérifie un secret de webhook en temps constant (anti timing attack). Fail-closed si non configuré. */
export function verifyWebhookSecret(provided: string, expected?: string): boolean {
  if (!expected) return false;
  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

export async function createOrderPayment(orderId: string, method: PaymentMethod) {
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) throw new AppError('Commande introuvable', 404);
  if (order.status !== 'PENDING_PAYMENT') throw new AppError('Cette commande a déjà été traitée', 409);

  return prisma.payment.create({
    data: {
      purpose: 'ORDER',
      boutiqueId: order.boutiqueId,
      orderId: order.id,
      amount: order.total,
      currency: order.currency,
      method,
      status: 'PENDING',
    },
  });
}

export async function createSubscriptionPayment(boutiqueId: string, plan: MerchantPlan, method: PaymentMethod) {
  if (plan === 'FREE') throw new AppError('Le plan Free ne nécessite aucun paiement', 400);
  const limits = PLAN_LIMITS[plan];

  const subscription = await prisma.merchantSubscription.findUniqueOrThrow({ where: { boutiqueId } });
  return prisma.payment.create({
    data: {
      purpose: 'PLATFORM_SUBSCRIPTION',
      boutiqueId,
      merchantSubscriptionId: subscription.id,
      amount: limits.priceHtg,
      currency: 'HTG',
      method,
      status: 'PENDING',
      metadata: { plan },
    },
  });
}

/**
 * Point d'entrée UNIQUE d'activation d'un paiement, appelé par tous les webhooks/flux
 * (Stripe, MonCash, preuve manuelle validée par un admin). Idempotent et atomique
 * (compare-and-swap sur Payment.status), dispatche selon `purpose`.
 *
 * @returns true si l'activation a été effectuée, false si déjà traité (idempotence)
 */
export async function activatePayment(paymentId: string, transactionId?: string): Promise<boolean> {
  const payment = await prisma.payment.findFirst({ where: { id: paymentId, status: 'PENDING' } });
  if (!payment) return false; // inconnu ou déjà traité → idempotent

  return prisma.$transaction(async (tx) => {
    const swap = await tx.payment.updateMany({
      where: { id: payment.id, status: 'PENDING' },
      data: { status: 'COMPLETED', providerRef: transactionId },
    });
    if (swap.count === 0) return false;

    if (payment.purpose === 'ORDER' && payment.orderId) {
      await activateOrder(tx, payment.orderId);
    } else if (payment.purpose === 'PLATFORM_SUBSCRIPTION' && payment.merchantSubscriptionId) {
      await activateSubscription(tx, payment.merchantSubscriptionId, payment.metadata as { plan?: MerchantPlan } | null);
    }

    return true;
  });
}

async function activateOrder(tx: Parameters<Parameters<typeof prisma.$transaction>[0]>[0], orderId: string) {
  const order = await tx.order.findUniqueOrThrow({
    where: { id: orderId },
    include: { items: { include: { product: true } } },
  });

  for (const item of order.items) {
    if (!item.product.trackStock) continue;
    // Compare-and-swap : décrémente uniquement si le stock est encore suffisant, empêchant
    // un stockQty négatif si plusieurs commandes concurrentes se disputent le même article.
    // Si la garde échoue, toute la transaction (y compris l'activation du paiement) est annulée :
    // le paiement reste PENDING et peut être rejoué/traité manuellement plutôt que de valider
    // une commande dont le stock n'existe plus.
    if (item.variantId) {
      const swap = await tx.productVariant.updateMany({
        where: { id: item.variantId, stockQty: { gte: item.quantity } },
        data: { stockQty: { decrement: item.quantity } },
      });
      if (swap.count === 0) {
        throw new AppError(`Stock insuffisant pour finaliser la commande ${order.orderNumber}`, 409);
      }
    } else {
      const swap = await tx.product.updateMany({
        where: { id: item.productId, stockQty: { gte: item.quantity } },
        data: { stockQty: { decrement: item.quantity } },
      });
      if (swap.count === 0) {
        throw new AppError(`Stock insuffisant pour finaliser la commande ${order.orderNumber}`, 409);
      }
    }
  }

  await tx.order.update({ where: { id: orderId }, data: { status: 'PAID' } });
  await tx.notification.create({
    data: {
      boutiqueId: order.boutiqueId,
      type: 'ORDER_PAID',
      title: 'Nouvelle commande payée',
      message: `La commande ${order.orderNumber} (${order.total} ${order.currency}) vient d'être payée.`,
      data: { orderId: order.id },
    },
  });
}

async function activateSubscription(
  tx: Parameters<Parameters<typeof prisma.$transaction>[0]>[0],
  merchantSubscriptionId: string,
  metadata: { plan?: MerchantPlan } | null
) {
  const plan = metadata?.plan;
  if (!plan || !PLAN_LIMITS[plan]) return;

  const subscription = await tx.merchantSubscription.update({
    where: { id: merchantSubscriptionId },
    data: { plan, isActive: true, expiresAt: new Date(Date.now() + SUBSCRIPTION_DURATION_MS) },
  });

  await tx.notification.create({
    data: {
      boutiqueId: subscription.boutiqueId,
      type: 'PLAN_UPGRADED',
      title: 'Abonnement mis à niveau',
      message: `Votre boutique est passée au plan ${PLAN_LIMITS[plan].label}.`,
      data: { plan },
    },
  });
}

/** Marque un paiement PENDING comme échoué (idempotent). */
export async function failPayment(paymentId: string): Promise<void> {
  await prisma.payment.updateMany({ where: { id: paymentId, status: 'PENDING' }, data: { status: 'FAILED' } });
}

/** Rejette une preuve : passe le paiement en FAILED (idempotent). */
export async function rejectPayment(paymentId: string, reason?: string) {
  const payment = await prisma.payment.findFirst({ where: { id: paymentId, status: 'PENDING' } });
  if (!payment) throw new AppError('Paiement introuvable ou déjà traité', 404);

  const result = await prisma.payment.updateMany({
    where: { id: paymentId, status: 'PENDING' },
    data: { status: 'FAILED', metadata: { ...(payment.metadata as object), rejectReason: reason } },
  });
  if (result.count === 0) throw new AppError('Paiement introuvable ou déjà traité', 404);

  if (payment.purpose === 'ORDER' && payment.orderId) {
    await prisma.notification.create({
      data: {
        boutiqueId: payment.boutiqueId,
        type: 'PAYMENT_FAILED',
        title: 'Paiement rejeté',
        message: reason ? `Preuve de paiement rejetée : ${reason}` : 'Preuve de paiement rejetée.',
        data: { orderId: payment.orderId },
      },
    });
  }

  return prisma.payment.findUniqueOrThrow({ where: { id: paymentId } });
}

// ─────────────────────────────────────────
// Preuve de paiement manuelle (Stripe/MonCash indisponibles ou credentials en attente)
// ─────────────────────────────────────────

interface ProofInput {
  transactionRef: string;
  senderName?: string;
  senderNumber?: string;
  note?: string;
  screenshot?: Buffer;
}

export async function submitOrderProof(orderId: string, input: ProofInput) {
  if (!input.transactionRef?.trim()) throw new AppError('La référence de la transaction est requise', 400);

  const existingPayment = await prisma.payment.findFirst({ where: { orderId, status: 'PENDING' } });
  const payment = existingPayment ?? (await createOrderPayment(orderId, 'MANUAL_PROOF'));

  let proofImageUrl: string | undefined;
  if (input.screenshot) {
    const uploaded = await uploadToCloudinary(input.screenshot, `payment-proofs/orders/${orderId}`, {
      transformation: [{ width: 1280, crop: 'limit', quality: 80 }],
    });
    proofImageUrl = uploaded.url;
  }

  return prisma.payment.update({
    where: { id: payment.id },
    data: {
      method: 'MANUAL_PROOF',
      metadata: {
        awaitingVerification: true,
        proof: {
          transactionRef: input.transactionRef.trim(),
          senderName: input.senderName?.trim() || null,
          senderNumber: input.senderNumber?.trim() || null,
          note: input.note?.trim() || null,
          imageUrl: proofImageUrl || null,
          submittedAt: new Date().toISOString(),
        },
      },
    },
  });
}

export async function submitSubscriptionProof(boutiqueId: string, plan: MerchantPlan, input: ProofInput) {
  if (!input.transactionRef?.trim()) throw new AppError('La référence de la transaction est requise', 400);

  const pending = await prisma.payment.findFirst({
    where: { boutiqueId, purpose: 'PLATFORM_SUBSCRIPTION', status: 'PENDING' },
  });
  if (pending) throw new AppError('Un paiement est déjà en attente de vérification pour cette boutique.', 409);

  const payment = await createSubscriptionPayment(boutiqueId, plan, 'MANUAL_PROOF');

  let proofImageUrl: string | undefined;
  if (input.screenshot) {
    const uploaded = await uploadToCloudinary(input.screenshot, `payment-proofs/subscriptions/${boutiqueId}`, {
      transformation: [{ width: 1280, crop: 'limit', quality: 80 }],
    });
    proofImageUrl = uploaded.url;
  }

  return prisma.payment.update({
    where: { id: payment.id },
    data: {
      metadata: {
        plan,
        awaitingVerification: true,
        proof: {
          transactionRef: input.transactionRef.trim(),
          senderName: input.senderName?.trim() || null,
          senderNumber: input.senderNumber?.trim() || null,
          note: input.note?.trim() || null,
          imageUrl: proofImageUrl || null,
          submittedAt: new Date().toISOString(),
        },
      },
    },
  });
}

export async function listPendingProofs() {
  return prisma.payment.findMany({
    where: { status: 'PENDING', method: 'MANUAL_PROOF' },
    include: { boutique: { select: { name: true, slug: true } }, order: { select: { orderNumber: true } } },
    orderBy: { createdAt: 'asc' },
  });
}

export function isPurposeOrder(purpose: PaymentPurpose): boolean {
  return purpose === 'ORDER';
}
