import Stripe from 'stripe';
import { PlanType } from '@prisma/client';
import prisma from '../../config/database';
import { env } from '../../config/env';
import { AppError } from '../../types';
import { PLAN_LIMITS } from '../../config/plans';

// Stripe ne facture pas en HTG : conversion en USD à un taux fixe, à ajuster manuellement
// selon le taux réel (pas d'API de taux de change branchée sur POSTA, contrairement à BANKA).
const TAUX_HTG_PAR_USD = 130;
const SUBSCRIPTION_DURATION_MS = 30 * 24 * 60 * 60 * 1000;

let stripeClient: Stripe | null = null;

function getStripe(): Stripe {
  if (!env.STRIPE_SECRET_KEY) throw new AppError(503, 'Paiement par carte non configuré');
  if (!stripeClient) stripeClient = new Stripe(env.STRIPE_SECRET_KEY);
  return stripeClient;
}

export async function createCheckoutSession(userId: string, plan: PlanType): Promise<string> {
  if (plan === 'FREE') throw new AppError(400, 'Le plan Free ne nécessite aucun paiement');
  const stripe = getStripe();

  const subscription = await prisma.subscription.findUniqueOrThrow({ where: { userId } });
  const montantHtg = PLAN_LIMITS[plan].prixHtg;
  const montantUsd = Math.max(1, Math.round((montantHtg / TAUX_HTG_PAR_USD) * 100));

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: { name: `POSTA — Plan ${PLAN_LIMITS[plan].label} (30 jours)` },
          unit_amount: montantUsd,
        },
        quantity: 1,
      },
    ],
    success_url: `${env.FRONTEND_URL}/app/billing?paiement=succes`,
    cancel_url: `${env.FRONTEND_URL}/app/billing?paiement=annule`,
    metadata: { userId, plan },
  });

  await prisma.payment.create({
    data: {
      subscriptionId: subscription.id,
      plan,
      montantHtg,
      methode: 'STRIPE',
      stripeSessionId: session.id,
    },
  });

  if (!session.url) throw new AppError(502, 'Stripe n\'a pas retourné d\'URL de paiement');
  return session.url;
}

export async function handleWebhook(rawBody: Buffer, signature: string): Promise<void> {
  const stripe = getStripe();
  if (!env.STRIPE_WEBHOOK_SECRET) throw new AppError(503, 'Webhook Stripe non configuré');

  const event = stripe.webhooks.constructEvent(rawBody, signature, env.STRIPE_WEBHOOK_SECRET);
  if (event.type !== 'checkout.session.completed') return;

  const session = event.data.object as Stripe.Checkout.Session;
  if (session.payment_status !== 'paid') return;

  const payment = await prisma.payment.findUnique({ where: { stripeSessionId: session.id } });
  if (!payment) return;

  // Idempotent : un webhook rejoué (Stripe retente en cas de non-200) ne réactive pas deux fois.
  const result = await prisma.payment.updateMany({
    where: { id: payment.id, statut: 'EN_ATTENTE' },
    data: { statut: 'VALIDE', valideAt: new Date() },
  });
  if (result.count === 0) return;

  await prisma.subscription.update({
    where: { id: payment.subscriptionId },
    data: { plan: payment.plan, expiresAt: new Date(Date.now() + SUBSCRIPTION_DURATION_MS) },
  });
}
