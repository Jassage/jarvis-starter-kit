import { Router, Request, Response } from 'express';
import type Stripe from 'stripe';
import { asyncHandler } from '../../utils/asyncHandler';
import { requireAuth } from '../../middlewares/auth.middleware';
import { sendSuccess } from '../../utils/response';
import prisma from '../../config/database';
import { AppError } from '../../middlewares/errorHandler.middleware';
import { env } from '../../config/env';
import { uploadAvatar } from '../../middlewares/upload.middleware';
import {
  PLAN_PRICES,
  initiatePlanPayment,
  activateSubscription,
  failPayment,
  verifyWebhookSecret,
  getPaymentNumbers,
  submitPaymentProof,
  initiateStripeCheckout,
  constructStripeEvent,
} from './payments.service';

/**
 * Webhook Stripe — monté à part dans app.ts, AVANT express.json(), avec un
 * body parser raw (la vérification de signature Stripe exige les octets
 * exacts envoyés, un body déjà parsé en JSON la casse).
 */
export async function stripeWebhookHandler(req: Request, res: Response) {
  const signature = req.headers['stripe-signature'];
  if (!signature || typeof signature !== 'string') {
    res.status(400).json({ success: false, message: 'Signature manquante' });
    return;
  }

  let event: Stripe.Event;
  try {
    event = constructStripeEvent(req.body as Buffer, signature);
  } catch {
    res.status(400).json({ success: false, message: 'Signature invalide' });
    return;
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const paymentId = session.metadata?.paymentId;
    if (paymentId) {
      await activateSubscription(paymentId, (session.payment_intent as string) || undefined);
    }
  }
  res.json({ received: true });
}

const router = Router();

// ─────────────────────────────────────────
// Webhooks PSP — PUBLICS (appelés par MonCash / NatCash, pas par un utilisateur
// connecté). Doivent rester AVANT `router.use(requireAuth)` et être authentifiés
// par secret partagé. Toute la logique métier vit dans activateSubscription().
// ─────────────────────────────────────────

/** Handler générique factorisé entre MonCash et NatCash. */
async function handlePspCallback(req: Request, res: Response, secretHeader: string, secret?: string) {
  if (!secret) throw new AppError('Webhook non configuré', 503); // fail-closed
  const provided = String(req.headers[secretHeader] || '');
  if (!verifyWebhookSecret(provided, secret)) {
    throw new AppError('Signature webhook invalide', 401);
  }

  const { orderId, transactionId, success } = req.body;
  if (!orderId) throw new AppError('orderId manquant', 400);

  if (success) {
    await activateSubscription(orderId, transactionId); // idempotent
  } else {
    await failPayment(orderId);
  }
  res.json({ success: true });
}

router.post('/moncash/callback', asyncHandler((req, res) =>
  handlePspCallback(req, res, 'x-moncash-signature', env.MONCASH_WEBHOOK_SECRET),
));

router.post('/natcash/callback', asyncHandler((req, res) =>
  handlePspCallback(req, res, 'x-natcash-signature', env.NATCASH_WEBHOOK_SECRET),
));

// ─── Routes authentifiées ───
router.use(requireAuth);

// Plans et tarifs
router.get('/plans', asyncHandler(async (_req, res) => {
  const plans = [
    {
      id: 'BASIC',
      name: PLAN_PRICES.BASIC.name,
      priceHTG: PLAN_PRICES.BASIC.htg,
      priceUSD: PLAN_PRICES.BASIC.usd,
      duration: PLAN_PRICES.BASIC.days,
      features: ['20 annonces actives', '90 jours par annonce', 'Photos illimitées', 'Messagerie'],
    },
    {
      id: 'PROFESSIONAL',
      name: PLAN_PRICES.PROFESSIONAL.name,
      priceHTG: PLAN_PRICES.PROFESSIONAL.htg,
      priceUSD: PLAN_PRICES.PROFESSIONAL.usd,
      duration: PLAN_PRICES.PROFESSIONAL.days,
      features: ['Annonces illimitées', '180 jours par annonce', '3 annonces sponsorisées/mois', 'Badge vérifié', 'Dashboard analytique', 'Support prioritaire'],
    },
    {
      id: 'ENTERPRISE',
      name: PLAN_PRICES.ENTERPRISE.name,
      priceHTG: PLAN_PRICES.ENTERPRISE.htg,
      priceUSD: PLAN_PRICES.ENTERPRISE.usd,
      duration: PLAN_PRICES.ENTERPRISE.days,
      features: ['Tout du Pro', 'API accès', 'Agent dédié', 'Logo agence vérifié', 'Intégration custom'],
    },
  ];
  sendSuccess(res, { plans });
}));

// Historique des paiements
router.get('/history', asyncHandler(async (req, res) => {
  const payments = await prisma.payment.findMany({
    where: { userId: req.user!.id },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });
  sendSuccess(res, { payments });
}));

// Initier un paiement MonCash
router.post('/moncash/initiate', asyncHandler(async (req, res) => {
  const { planId, currency } = req.body;
  const { payment } = await initiatePlanPayment(req.user!.id, planId, currency, 'MONCASH');

  // TODO: intégrer l'API MonCash réelle (credentials Digicel Business)
  sendSuccess(res, {
    paymentId: payment.id,
    redirectUrl: `https://moncashbutton.digicelhaiti.com/checkout/${payment.id}`,
    orderId: payment.id,
  }, 'Paiement initié');
}));

// Initier un paiement NatCash
router.post('/natcash/initiate', asyncHandler(async (req, res) => {
  const { planId, currency } = req.body;
  const { payment } = await initiatePlanPayment(req.user!.id, planId, currency, 'NATCASH');

  // TODO: intégrer l'API NatCash réelle (credentials Natcom)
  sendSuccess(res, {
    paymentId: payment.id,
    redirectUrl: `https://natcash.natcom.com.ht/checkout/${payment.id}`,
    orderId: payment.id,
  }, 'Paiement initié');
}));

// Créer une session de paiement par carte (Stripe Checkout)
router.post('/stripe/checkout', asyncHandler(async (req, res) => {
  const { planId } = req.body;
  const { url } = await initiateStripeCheckout(req.user!.id, planId);
  sendSuccess(res, { url }, 'Session de paiement créée');
}));

// ─── Paiement manuel (preuve de transfert) ───

// Numéros MonCash / NatCash où envoyer l'argent
router.get('/methods', asyncHandler(async (_req, res) => {
  const numbers = await getPaymentNumbers();
  sendSuccess(res, { numbers });
}));

// Soumettre une preuve de transfert (référence + capture optionnelle)
router.post('/submit-proof', uploadAvatar.single('screenshot'), asyncHandler(async (req, res) => {
  const { planId, method, currency, transactionRef, senderName, senderNumber, note } = req.body;
  const payment = await submitPaymentProof(req.user!.id, {
    planId,
    method,
    currency,
    transactionRef,
    senderName,
    senderNumber,
    note,
    screenshot: req.file?.buffer,
  });
  sendSuccess(res, { payment }, 'Preuve reçue. Votre plan sera activé après vérification (sous 24h).', 201);
}));

export default router;
