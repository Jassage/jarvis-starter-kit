import crypto from "crypto";
import Stripe from "stripe";
import { PaymentMethod, SubscriptionPlan } from "@prisma/client";
import prisma from "../../config/database";
import { AppError } from "../../middlewares/errorHandler.middleware";
import { sendEmail, subscriptionActivatedTemplate } from "../../utils/email";
import { uploadToCloudinary } from "../../config/cloudinary";
import { getIO } from "../../config/socket";
import { env } from "../../config/env";

// Source de vérité unique des tarifs (partagée entre /plans, initiate MonCash et NatCash)
// `days` = durée réellement accordée à l'activation, doit correspondre à ce qui est
// annoncé sur la page pricing frontend (Basic "/ 3 mois", Professionnel "/ 6 mois").
export const PLAN_PRICES: Record<
  string,
  { htg: number; usd: number; name: string; days: number }
> = {
  BASIC: { htg: 2500, usd: 20, name: "Basic", days: 90 },
  PROFESSIONAL: { htg: 7500, usd: 60, name: "Professionnel", days: 180 },
  ENTERPRISE: { htg: 20000, usd: 160, name: "Entreprise", days: 365 },
};

// Plans qui confèrent le badge "vérifié / pro". Le badge est DÉRIVÉ du plan
// (pas de champ dupliqué en base) — à consommer côté front via subscription.plan.
const PRO_PLANS: SubscriptionPlan[] = ["PROFESSIONAL", "ENTERPRISE"];
export function isProPlan(plan?: SubscriptionPlan | null): boolean {
  return !!plan && PRO_PLANS.includes(plan);
}

/**
 * Vérifie un secret de webhook en temps constant (anti timing attack).
 * Fail-closed : si aucun secret n'est configuré côté serveur, renvoie false.
 */
export function verifyWebhookSecret(
  provided: string,
  expected?: string,
): boolean {
  if (!expected) return false;
  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

/**
 * Crée un paiement PENDING pour un plan donné, via le PSP choisi.
 * Retourne le paiement + les infos de redirection.
 */
export async function initiatePlanPayment(
  userId: string,
  planId: string,
  currency: string | undefined,
  method: PaymentMethod,
) {
  const price = PLAN_PRICES[planId];
  if (!price) throw new AppError("Plan invalide", 400);

  const cur = currency === "USD" ? "USD" : "HTG";
  const amount = cur === "USD" ? price.usd : price.htg;

  const payment = await prisma.payment.create({
    data: {
      userId,
      amount,
      currency: cur,
      method,
      status: "PENDING",
      description: `Abonnement LAKAY ${planId}`,
      metadata: { planId },
    },
  });

  return { payment, amount, currency: cur };
}

// ─────────────────────────────────────────
// STRIPE (carte bancaire — utile pour la diaspora, paiement immédiat)
// ─────────────────────────────────────────

let stripeClient: Stripe | null = null;
function getStripe(): Stripe {
  if (!env.STRIPE_SECRET_KEY)
    throw new AppError("Paiement par carte non configuré", 503); // fail-closed
  if (!stripeClient) stripeClient = new Stripe(env.STRIPE_SECRET_KEY);
  return stripeClient;
}

/**
 * Crée un Payment PENDING (method STRIPE) puis une Checkout Session Stripe
 * en USD, avec paymentId en metadata pour le retrouver au webhook.
 */
export async function initiateStripeCheckout(userId: string, planId: string) {
  const price = PLAN_PRICES[planId];
  if (!price) throw new AppError("Plan invalide", 400);

  const { payment } = await initiatePlanPayment(
    userId,
    planId,
    "USD",
    "STRIPE",
  );
  const stripe = getStripe();

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: "usd",
          unit_amount: Math.round(price.usd * 100),
          product_data: { name: `Abonnement LAKAY ${price.name}` },
        },
        quantity: 1,
      },
    ],
    metadata: { paymentId: payment.id },
    success_url: `${env.FRONTEND_URL}/dashboard?stripe=success`,
    cancel_url: `${env.FRONTEND_URL}/pricing?stripe=cancelled`,
  });

  if (!session.url)
    throw new AppError("Impossible de créer la session de paiement", 502);
  return { url: session.url };
}

/** Vérifie la signature Stripe et décode l'événement (lève si secret absent ou signature invalide). */
export function constructStripeEvent(
  rawBody: Buffer,
  signature: string,
): Stripe.Event {
  if (!env.STRIPE_WEBHOOK_SECRET)
    throw new AppError("Webhook Stripe non configuré", 503);
  return getStripe().webhooks.constructEvent(
    rawBody,
    signature,
    env.STRIPE_WEBHOOK_SECRET,
  );
}

/**
 * Point d'entrée UNIQUE d'activation d'abonnement, appelé par les webhooks
 * MonCash, NatCash ET Stripe. Idempotent et atomique.
 *
 * Effets, selon le plan payé :
 *  - Paiement → COMPLETED (compare-and-swap sur PENDING)
 *  - Subscription upsert (plan + endDate + isActive)
 *  - ENTERPRISE + compte agence → Agency.isVerified = true (feature "logo agence vérifié")
 *  - Notification en base + email de confirmation
 *
 * Le badge "vérifié/pro" général n'est PAS stocké : il se dérive de subscription.plan.
 *
 * @returns true si l'activation a été effectuée, false si déjà traité (idempotence)
 */
export async function activateSubscription(
  paymentId: string,
  transactionId?: string,
): Promise<boolean> {
  const payment = await prisma.payment.findFirst({
    where: { id: paymentId, status: "PENDING" },
  });
  if (!payment) return false; // inconnu ou déjà traité → idempotent

  const planId = (payment.metadata as { planId?: string } | null)?.planId;

  const activated = await prisma.$transaction(async (tx) => {
    // Compare-and-swap : ne bascule que si TOUJOURS PENDING (anti double-traitement concurrent)
    const swap = await tx.payment.updateMany({
      where: { id: payment.id, status: "PENDING" },
      data: { status: "COMPLETED", providerRef: transactionId },
    });
    if (swap.count === 0) return false;

    if (!planId || !PLAN_PRICES[planId]) return true; // paiement hors-plan (ex. sponsoring) : rien de plus

    const plan = planId as SubscriptionPlan;
    const currentSubscription = await tx.subscription.findUnique({
      where: { userId: payment.userId },
    });
    const now = new Date();
    const baseDate =
      currentSubscription?.endDate && currentSubscription.endDate > now
        ? currentSubscription.endDate
        : now;
    const endDate = new Date(baseDate);
    endDate.setDate(endDate.getDate() + PLAN_PRICES[planId].days);

    const subscription = await tx.subscription.upsert({
      where: { userId: payment.userId },
      create: { userId: payment.userId, plan, endDate, isActive: true },
      update: {
        plan,
        endDate,
        isActive: true,
        startDate:
          currentSubscription?.endDate && currentSubscription.endDate > now
            ? currentSubscription.startDate
            : now,
      },
    });
    // Lie le paiement à l'abonnement pour l'historique
    await tx.payment.update({
      where: { id: payment.id },
      data: { subscriptionId: subscription.id },
    });

    // ENTERPRISE : vérifie l'agence du compte, si c'en est un
    if (plan === "ENTERPRISE") {
      const agency = await tx.agency.findUnique({
        where: { ownerId: payment.userId },
        select: { id: true },
      });
      if (agency) {
        await tx.agency.update({
          where: { id: agency.id },
          data: { isVerified: true },
        });
      }
    }

    // Notification en base
    await tx.notification.create({
      data: {
        userId: payment.userId,
        type: "PAYMENT_SUCCESS",
        title: "Abonnement activé",
        message: `Votre abonnement ${PLAN_PRICES[planId].name} est actif pour ${PLAN_PRICES[planId].days} jours.`,
        data: { plan: planId, paymentId: payment.id },
        link: "/dashboard",
      },
    });

    return true;
  });

  // Effets hors transaction (best-effort)
  if (activated && planId && PLAN_PRICES[planId]) {
    // Notifie le front en temps réel pour rafraîchir le plan affiché
    try {
      getIO()
        .to(`user:${payment.userId}`)
        .emit("subscription_updated", { plan: planId });
    } catch {
      /* Socket non disponible */
    }

    const user = await prisma.user.findUnique({
      where: { id: payment.userId },
      select: { email: true, firstName: true },
    });
    if (user) {
      await sendEmail({
        to: user.email,
        subject: `🎉 Abonnement ${PLAN_PRICES[planId].name} activé — LAKAY`,
        html: subscriptionActivatedTemplate(
          user.firstName,
          PLAN_PRICES[planId].name,
        ),
      });
    }
  }

  return activated;
}

/** Marque un paiement PENDING comme échoué (idempotent). */
export async function failPayment(paymentId: string): Promise<void> {
  await prisma.payment.updateMany({
    where: { id: paymentId, status: "PENDING" },
    data: { status: "FAILED" },
  });
}

// Un checkout Stripe/MonCash/NatCash initié puis jamais finalisé reste PENDING
// indéfiniment (aucun webhook ne viendra jamais le clore). Au-delà de ce délai,
// il est considéré abandonné. Ne s'applique jamais à une preuve manuelle déjà
// soumise (`awaitingVerification: true`) : celle-ci attend une action admin.
const PENDING_PAYMENT_STALE_MS = 2 * 60 * 60 * 1000; // 2h

/**
 * Échoue les paiements PENDING orphelins (checkout abandonné) plus vieux que
 * le délai de grâce, pour éviter qu'ils bloquent indéfiniment toute nouvelle
 * tentative de paiement de l'utilisateur (cf. submitPaymentProof).
 *
 * @returns le nombre de paiements marqués FAILED
 */
export async function expireStalePendingPayments(): Promise<number> {
  const cutoff = new Date(Date.now() - PENDING_PAYMENT_STALE_MS);
  const result = await prisma.payment.updateMany({
    where: {
      status: "PENDING",
      createdAt: { lt: cutoff },
      NOT: { metadata: { path: ["awaitingVerification"], equals: true } },
    },
    data: { status: "FAILED" },
  });
  return result.count;
}

// ─────────────────────────────────────────
// PAIEMENT MANUEL (en attendant l'intégration API MonCash/NatCash)
// L'utilisateur transfère l'argent au numéro affiché puis soumet une preuve.
// L'admin vérifie et active (via activateSubscription) ou rejette (failPayment).
// ─────────────────────────────────────────

// Numéros de réception, éditables par l'admin via SystemConfig (clés PAYMENT_*).
const PAYMENT_NUMBER_DEFAULTS: Record<
  string,
  { number: string; name: string }
> = {
  MONCASH: { number: "+509 0000-0000", name: "LAKAY" },
  NATCASH: { number: "+509 0000-0000", name: "LAKAY" },
};

export async function getPaymentNumbers() {
  const configs = await prisma.systemConfig.findMany({
    where: {
      key: {
        in: [
          "PAYMENT_MONCASH_NUMBER",
          "PAYMENT_MONCASH_NAME",
          "PAYMENT_NATCASH_NUMBER",
          "PAYMENT_NATCASH_NAME",
        ],
      },
    },
  });
  const map = Object.fromEntries(configs.map((c) => [c.key, c.value]));
  return {
    MONCASH: {
      number:
        map.PAYMENT_MONCASH_NUMBER || PAYMENT_NUMBER_DEFAULTS.MONCASH.number,
      name: map.PAYMENT_MONCASH_NAME || PAYMENT_NUMBER_DEFAULTS.MONCASH.name,
    },
    NATCASH: {
      number:
        map.PAYMENT_NATCASH_NUMBER || PAYMENT_NUMBER_DEFAULTS.NATCASH.number,
      name: map.PAYMENT_NATCASH_NAME || PAYMENT_NUMBER_DEFAULTS.NATCASH.name,
    },
  };
}

interface ProofInput {
  planId: string;
  method: PaymentMethod;
  currency?: string;
  transactionRef: string;
  senderName?: string;
  senderNumber?: string;
  note?: string;
  screenshot?: Buffer;
}

/**
 * Enregistre une preuve de transfert manuel : crée un Payment PENDING
 * marqué `awaitingVerification`, avec la référence de transaction et une
 * capture optionnelle (Cloudinary). L'admin devra valider.
 */
export async function submitPaymentProof(userId: string, input: ProofInput) {
  const price = PLAN_PRICES[input.planId];
  if (!price) throw new AppError("Plan invalide", 400);
  if (input.method !== "MONCASH" && input.method !== "NATCASH") {
    throw new AppError("Méthode de paiement invalide", 400);
  }
  if (!input.transactionRef?.trim()) {
    throw new AppError("La référence de la transaction est requise", 400);
  }

  // Empêche l'accumulation de vraies preuves en double, sans bloquer sur un
  // paiement PENDING orphelin (Stripe/MonCash/NatCash initié puis abandonné,
  // qui n'a jamais reçu de preuve manuelle) — celui-ci est simplement annulé.
  const pending = await prisma.payment.findFirst({
    where: { userId, status: "PENDING" },
    select: { id: true, metadata: true },
  });
  if (pending) {
    const isAwaitingVerification =
      (pending.metadata as { awaitingVerification?: boolean } | null)
        ?.awaitingVerification === true;
    if (isAwaitingVerification) {
      throw new AppError(
        "Vous avez déjà un paiement en attente de vérification.",
        409,
      );
    }
    await failPayment(pending.id);
  }

  let proofImageUrl: string | undefined;
  if (input.screenshot) {
    const uploaded = await uploadToCloudinary(
      input.screenshot,
      `payment-proofs/${userId}`,
      {
        transformation: [{ width: 1280, crop: "limit", quality: 80 }],
      },
    );
    proofImageUrl = uploaded.url;
  }

  const cur = input.currency === "USD" ? "USD" : "HTG";
  const amount = cur === "USD" ? price.usd : price.htg;

  return prisma.payment.create({
    data: {
      userId,
      amount,
      currency: cur,
      method: input.method,
      status: "PENDING",
      description: `Abonnement LAKAY ${input.planId} (preuve manuelle)`,
      metadata: {
        planId: input.planId,
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

// ─────────────────────────────────────────
// EXPIRATION DES ABONNEMENTS (job périodique)
// ─────────────────────────────────────────

/**
 * Rétrograde en FREE tous les abonnements payants dont endDate est dépassée,
 * et retire la vérification des agences correspondantes (feature ENTERPRISE).
 * Le badge "pro" se corrige seul puisqu'il est dérivé du plan.
 *
 * @returns le nombre d'abonnements rétrogradés
 */
export async function expireSubscriptions(): Promise<number> {
  const now = new Date();

  const expired = await prisma.subscription.findMany({
    where: {
      plan: { not: "FREE" },
      isActive: true,
      endDate: { not: null, lt: now },
    },
    select: { id: true, userId: true, plan: true },
  });
  if (expired.length === 0) return 0;

  for (const sub of expired) {
    await prisma.$transaction(async (tx) => {
      // Repasse en FREE (FREE reste "actif" : c'est le socle gratuit)
      const updated = await tx.subscription.updateMany({
        where: {
          id: sub.id,
          plan: { not: "FREE" },
          isActive: true,
          endDate: { not: null, lt: now },
        },
        data: { plan: "FREE", isActive: true, endDate: null },
      });
      if (updated.count === 0) return;

      // Retire la vérification de l'agence si l'ancien plan était ENTERPRISE
      if (sub.plan === "ENTERPRISE") {
        await tx.agency.updateMany({
          where: { ownerId: sub.userId, isVerified: true },
          data: { isVerified: false },
        });
      }

      await tx.notification.create({
        data: {
          userId: sub.userId,
          type: "SUBSCRIPTION_EXPIRING",
          title: "Abonnement expiré",
          message:
            "Votre abonnement est arrivé à échéance. Vous êtes repassé au plan gratuit. Renouvelez pour retrouver vos avantages.",
          data: { previousPlan: sub.plan },
          link: "/pricing",
        },
      });
    });
  }

  return expired.length;
}

/** Rejette une preuve : passe le paiement en FAILED + notifie l'utilisateur. */
export async function rejectPayment(paymentId: string, reason?: string) {
  const payment = await prisma.payment.findFirst({
    where: { id: paymentId, status: "PENDING" },
    select: { userId: true },
  });
  if (!payment) throw new AppError("Paiement introuvable ou déjà traité", 404);

  await prisma.$transaction(async (tx) => {
    const result = await tx.payment.updateMany({
      where: { id: paymentId, status: "PENDING" },
      data: { status: "FAILED" },
    });
    if (result.count === 0)
      throw new AppError("Paiement introuvable ou déjà traité", 404);

    await tx.notification.create({
      data: {
        userId: payment.userId,
        type: "PAYMENT_FAILED",
        title: "Paiement non validé",
        message: reason
          ? `Votre preuve de paiement a été rejetée : ${reason}`
          : "Votre preuve de paiement n'a pas pu être validée. Contactez le support.",
        data: { paymentId },
        link: "/pricing",
      },
    });
  });
}
