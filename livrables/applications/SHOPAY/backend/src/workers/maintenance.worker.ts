import prisma from '../config/database';
import { logger } from '../utils/logger';

const ABANDONED_ORDER_TTL_MS = 24 * 60 * 60 * 1000;

/** Annule les commandes PENDING_PAYMENT abandonnées depuis plus de 24h (panier jamais payé). */
async function expireAbandonedOrders(): Promise<number> {
  const cutoff = new Date(Date.now() - ABANDONED_ORDER_TTL_MS);
  const result = await prisma.order.updateMany({
    where: { status: 'PENDING_PAYMENT', createdAt: { lt: cutoff } },
    data: { status: 'CANCELLED' },
  });
  return result.count;
}

/** Rétrograde en FREE les abonnements marchands payants dont expiresAt est dépassée. */
async function expireMerchantSubscriptions(): Promise<number> {
  const result = await prisma.merchantSubscription.updateMany({
    where: { plan: { not: 'FREE' }, expiresAt: { not: null, lt: new Date() } },
    data: { plan: 'FREE', expiresAt: null },
  });
  return result.count;
}

export async function runMaintenanceSweep(): Promise<{ orders: number; subscriptions: number }> {
  const [orders, subscriptions] = await Promise.all([expireAbandonedOrders(), expireMerchantSubscriptions()]);
  if (orders || subscriptions) {
    logger.info({ orders, subscriptions }, 'Balayage de maintenance effectué');
  }
  return { orders, subscriptions };
}
