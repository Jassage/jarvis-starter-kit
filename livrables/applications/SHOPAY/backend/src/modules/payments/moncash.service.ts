import { MerchantPlan, PaymentMethod } from '@prisma/client';
import { AppError } from '../../types';
import { env } from '../../config/env';
import { createOrderPayment, createSubscriptionPayment } from './payments.service';

const METHOD: PaymentMethod = 'MONCASH';

function assertConfigured() {
  // Credentials Digicel Business Haiti toujours en attente (comme sur KONEKTE/LAKAY/POSTA) :
  // le scaffold reste fail-closed tant que MONCASH_CLIENT_ID/SECRET ne sont pas fournis.
  if (!env.MONCASH_CLIENT_ID || !env.MONCASH_CLIENT_SECRET) {
    throw new AppError('Paiement MonCash non configuré (credentials Digicel en attente)', 503);
  }
}

export async function initiateOrderMoncash(orderId: string) {
  assertConfigured();
  const payment = await createOrderPayment(orderId, METHOD);
  // TODO: intégrer l'API MonCash réelle (credentials Digicel Business) dès réception
  return {
    paymentId: payment.id,
    redirectUrl: `https://moncashbutton.digicelhaiti.com/checkout/${payment.id}`,
  };
}

export async function initiateSubscriptionMoncash(boutiqueId: string, plan: MerchantPlan) {
  assertConfigured();
  const payment = await createSubscriptionPayment(boutiqueId, plan, METHOD);
  return {
    paymentId: payment.id,
    redirectUrl: `https://moncashbutton.digicelhaiti.com/checkout/${payment.id}`,
  };
}

export function getMoncashNumber() {
  return { number: env.PAYMENT_MONCASH_NUMBER, name: env.PAYMENT_MONCASH_NAME };
}
