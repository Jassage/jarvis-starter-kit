import Stripe from "stripe";
import axios from "axios";
import { Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma";

// ─── Plans ───────────────────────────────────────────────────────────────────

export const PLANS: Record<string, { label: string; months: number; usd: number; htg: number }> = {
  "1mo":  { label: "1 mois",  months: 1,  usd: 500,  htg: 50000  }, // en centimes USD / centimes HTG
  "3mo":  { label: "3 mois",  months: 3,  usd: 1200, htg: 120000 },
  "6mo":  { label: "6 mois",  months: 6,  usd: 2000, htg: 200000 },
};

// ─── Stripe ──────────────────────────────────────────────────────────────────

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_placeholder", {
  apiVersion: "2026-05-27.dahlia",
});

export async function createStripeSession(userId: string, planId: string, mobile = false) {
  const plan = PLANS[planId];
  if (!plan) throw new Error("Plan invalide");

  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3001";
  // L'app mobile n'a pas de page web /premium — Stripe doit rediriger vers
  // un deep link (scheme "konekte") que WebBrowser.openAuthSessionAsync
  // intercepte pour fermer l'onglet et revenir dans l'app.
  const successUrl = mobile
    ? "konekte://premium/success?session_id={CHECKOUT_SESSION_ID}"
    : `${frontendUrl}/premium/success?session_id={CHECKOUT_SESSION_ID}`;
  const cancelUrl = mobile ? "konekte://premium/cancel" : `${frontendUrl}/premium?cancelled=1`;

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    mode: "payment",
    line_items: [
      {
        price_data: {
          currency: "usd",
          unit_amount: plan.usd,
          product_data: { name: `Konekte Premium — ${plan.label}` },
        },
        quantity: 1,
      },
    ],
    metadata: { userId, planId },
    success_url: successUrl,
    cancel_url: cancelUrl,
  });

  return { url: session.url, sessionId: session.id };
}

export async function handleStripeWebhook(rawBody: Buffer, signature: string) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || "";
  const event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);

  // Idempotence : Stripe peut renvoyer le même event (retry, replay) ; la
  // contrainte unique sur l'id garantit qu'un seul appel active le Premium.
  try {
    await prisma.webhookEvent.create({ data: { id: event.id, provider: "stripe" } });
  } catch (err: unknown) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      return; // déjà traité
    }
    throw err; // erreur transitoire : Stripe réessaiera cet event
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as { metadata?: Record<string, string> };
    const { userId, planId } = session.metadata || {};
    if (userId && planId) await activatePremium(userId, planId);
  }
}

// ─── MonCash ──────────────────────────────────────────────────────────────────

const MONCASH_BASE = process.env.MONCASH_ENV === "sandbox"
  ? "https://sandbox.api.moncashbutton.digicelgroup.com"
  : "https://api.moncashbutton.digicelgroup.com";

async function getMoncashToken(): Promise<string> {
  const credentials = Buffer.from(
    `${process.env.MONCASH_CLIENT_ID}:${process.env.MONCASH_CLIENT_SECRET}`
  ).toString("base64");

  const res = await axios.post(
    `${MONCASH_BASE}/Api/v1/CreatePayment`,
    new URLSearchParams({ scope: "read,write", grant_type: "client_credentials" }),
    {
      headers: {
        Authorization: `Basic ${credentials}`,
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/json",
      },
      baseURL: MONCASH_BASE,
    }
  );
  // MonCash token endpoint is separate
  const tokenRes = await axios.post(
    `${MONCASH_BASE}/oauth/token`,
    new URLSearchParams({ scope: "read,write", grant_type: "client_credentials" }),
    {
      headers: {
        Authorization: `Basic ${credentials}`,
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/json",
      },
    }
  );
  return tokenRes.data.access_token;
}

export async function createMoncashPayment(userId: string, planId: string) {
  const plan = PLANS[planId];
  if (!plan) throw new Error("Plan invalide");

  const orderId = `KNK-${userId.slice(-6)}-${Date.now()}`;
  const amountHTG = plan.htg / 100; // en HTG

  const token = await getMoncashToken();

  const res = await axios.post(
    `${MONCASH_BASE}/Api/v1/CreatePayment`,
    { amount: amountHTG, orderId },
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    }
  );

  // Sauvegarder l'orderId pour vérifier lors du callback
  await prisma.user.update({
    where: { id: userId },
    data: { resetPasswordToken: `moncash_${orderId}_${planId}` }, // champ temporaire réutilisé
  });

  const paymentToken = res.data.payment_token?.token;
  const redirectUrl = process.env.MONCASH_ENV === "sandbox"
    ? `https://sandbox.moncashbutton.digicelgroup.com/Moncash-middleware/Pay?token=${paymentToken}`
    : `https://moncashbutton.digicelgroup.com/Moncash-middleware/Pay?token=${paymentToken}`;

  return { redirectUrl, orderId };
}

export async function verifyMoncashPayment(orderId: string) {
  const token = await getMoncashToken();

  const res = await axios.post(
    `${MONCASH_BASE}/Api/v1/RetrieveOrderPayment`,
    { orderId },
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    }
  );

  const payment = res.data.payment;
  if (payment?.message !== "successful") return false;

  // Retrouver userId depuis l'orderId stocké
  const marker = `moncash_${orderId}_`;
  const user = await prisma.user.findFirst({
    where: { resetPasswordToken: { startsWith: marker } },
  });
  if (!user) return true; // déjà traité (marqueur déjà consommé) ou orderId inconnu

  // Verrou atomique : le callback peut être appelé plusieurs fois pour le même
  // paiement (retry MonCash, refresh navigateur). Seul l'appel qui réussit à
  // consommer le marqueur active le Premium ; les autres no-op.
  const claimed = await prisma.user.updateMany({
    where: { id: user.id, resetPasswordToken: user.resetPasswordToken },
    data: { resetPasswordToken: null },
  });
  if (claimed.count === 0) return true; // consommé entre-temps par un appel concurrent

  const planId = user.resetPasswordToken?.replace(marker, "") || "1mo";
  await activatePremium(user.id, planId);
  return true;
}

// ─── Activation Premium ───────────────────────────────────────────────────────

export async function activatePremium(userId: string, planId: string) {
  const plan = PLANS[planId];
  if (!plan) return;

  const existing = await prisma.user.findUnique({ where: { id: userId } });
  const base = existing?.subscriptionExpiry && existing.subscriptionExpiry > new Date()
    ? existing.subscriptionExpiry
    : new Date();

  const expiry = new Date(base);
  expiry.setMonth(expiry.getMonth() + plan.months);

  // "Boost mensuel" (avantage annoncé du Premium) : un crédit de boost par
  // mois payé, cumulable avec les crédits déjà en réserve.
  await prisma.user.update({
    where: { id: userId },
    data: {
      subscriptionPlan: "PREMIUM",
      subscriptionExpiry: expiry,
      boostsRemaining: { increment: plan.months },
    },
  });
}
