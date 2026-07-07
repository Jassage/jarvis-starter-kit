import Stripe from 'stripe';
import { MerchantPlan } from '@prisma/client';
import prisma from '../../config/database';
import { env } from '../../config/env';
import { AppError } from '../../types';
import { PLAN_LIMITS } from '../../config/plans';
import { createOrderPayment, createSubscriptionPayment } from './payments.service';

// Stripe ne facture pas en HTG : conversion USD à un taux fixe (comme sur les autres SaaS
// du portefeuille sans API de taux de change branchée), à ajuster manuellement si besoin.
const TAUX_HTG_PAR_USD = 130;

let stripeClient: Stripe | null = null;
function getStripe(): Stripe {
  if (!env.STRIPE_SECRET_KEY) throw new AppError('Paiement par carte non configuré', 503); // fail-closed
  if (!stripeClient) stripeClient = new Stripe(env.STRIPE_SECRET_KEY);
  return stripeClient;
}

function htgToUsdCents(amountHtg: number): number {
  return Math.max(1, Math.round((amountHtg / TAUX_HTG_PAR_USD) * 100));
}

export async function createOrderCheckoutSession(orderId: string) {
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) throw new AppError('Commande introuvable', 404);
  if (order.status !== 'PENDING_PAYMENT') throw new AppError('Cette commande a déjà été traitée', 409);

  const stripe = getStripe(); // vérifié avant toute écriture : évite un Payment PENDING orphelin si Stripe n'est pas configuré
  const payment = await createOrderPayment(orderId, 'STRIPE');
  const amountUsd = order.currency === 'USD' ? Math.round(Number(order.total) * 100) : htgToUsdCents(Number(order.total));

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: 'usd',
          unit_amount: amountUsd,
          product_data: { name: `Commande ${order.orderNumber}` },
        },
        quantity: 1,
      },
    ],
    metadata: { paymentId: payment.id },
    success_url: `${env.FRONTEND_URL}/store/checkout/success?order=${order.orderNumber}`,
    cancel_url: `${env.FRONTEND_URL}/store/checkout?cancelled=1`,
  });

  if (!session.url) throw new AppError("Stripe n'a pas retourné d'URL de paiement", 502);
  return session.url;
}

export async function createSubscriptionCheckoutSession(boutiqueId: string, plan: MerchantPlan) {
  if (plan === 'FREE') throw new AppError('Le plan Free ne nécessite aucun paiement', 400);
  const stripe = getStripe(); // vérifié avant toute écriture : évite un Payment PENDING orphelin si Stripe n'est pas configuré
  const payment = await createSubscriptionPayment(boutiqueId, plan, 'STRIPE');
  const amountUsd = htgToUsdCents(PLAN_LIMITS[plan].priceHtg);

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: 'usd',
          unit_amount: amountUsd,
          product_data: { name: `SHOPAY — Plan ${PLAN_LIMITS[plan].label} (30 jours)` },
        },
        quantity: 1,
      },
    ],
    metadata: { paymentId: payment.id },
    success_url: `${env.FRONTEND_URL}/dashboard/billing?paiement=succes`,
    cancel_url: `${env.FRONTEND_URL}/dashboard/billing?paiement=annule`,
  });

  if (!session.url) throw new AppError("Stripe n'a pas retourné d'URL de paiement", 502);
  return session.url;
}

/** Vérifie la signature Stripe et décode l'événement (lève si secret absent ou signature invalide). */
export function constructStripeEvent(rawBody: Buffer, signature: string): Stripe.Event {
  if (!env.STRIPE_WEBHOOK_SECRET) throw new AppError('Webhook Stripe non configuré', 503);
  return getStripe().webhooks.constructEvent(rawBody, signature, env.STRIPE_WEBHOOK_SECRET);
}

export function extractPaymentId(event: Stripe.Event): { paymentId?: string; providerRef?: string } {
  if (event.type !== 'checkout.session.completed') return {};
  const session = event.data.object as Stripe.Checkout.Session;
  if (session.payment_status !== 'paid') return {};
  return { paymentId: session.metadata?.paymentId, providerRef: (session.payment_intent as string) || undefined };
}
