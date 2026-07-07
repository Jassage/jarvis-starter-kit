import { Request, Response } from 'express';
import type Stripe from 'stripe';
import * as paymentsService from './payments.service';
import * as stripeService from './stripe.service';
import * as moncashService from './moncash.service';
import { sendSuccess } from '../../utils/response';
import { AuthRequest, AppError } from '../../types';
import { env } from '../../config/env';

export async function createOrderCheckoutSession(req: AuthRequest, res: Response) {
  const url = await stripeService.createOrderCheckoutSession(req.body.orderId);
  sendSuccess(res, { url }, 'Session de paiement créée', 201);
}

export async function initiateOrderMoncash(req: AuthRequest, res: Response) {
  const result = await moncashService.initiateOrderMoncash(req.body.orderId);
  sendSuccess(res, result, 'Paiement initié, suivez les instructions MonCash', 201);
}

export async function getMoncashMethods(_req: AuthRequest, res: Response) {
  sendSuccess(res, { moncash: moncashService.getMoncashNumber() });
}

export async function submitOrderProof(req: AuthRequest, res: Response) {
  const { orderId, transactionRef, senderName, senderNumber, note } = req.body;
  const payment = await paymentsService.submitOrderProof(orderId, {
    transactionRef,
    senderName,
    senderNumber,
    note,
    screenshot: req.file?.buffer,
  });
  sendSuccess(res, { payment }, 'Preuve reçue. Votre commande sera validée après vérification (sous 24h).', 201);
}

/** Webhook Stripe — monté à part dans app.ts, AVANT express.json(), body parser raw. */
export async function stripeWebhookHandler(req: Request, res: Response) {
  const signature = req.headers['stripe-signature'];
  if (!signature || typeof signature !== 'string') {
    res.status(400).json({ success: false, message: 'Signature manquante' });
    return;
  }

  let event: Stripe.Event;
  try {
    event = stripeService.constructStripeEvent(req.body as Buffer, signature);
  } catch {
    res.status(400).json({ success: false, message: 'Signature invalide' });
    return;
  }

  const { paymentId, providerRef } = stripeService.extractPaymentId(event);
  if (paymentId) await paymentsService.activatePayment(paymentId, providerRef);
  res.json({ received: true });
}

/** Callback MonCash — public, authentifié par secret partagé (fail-closed). */
export async function moncashCallback(req: Request, res: Response) {
  const provided = String(req.headers['x-moncash-signature'] || '');
  if (!paymentsService.verifyWebhookSecret(provided, env.MONCASH_WEBHOOK_SECRET)) {
    throw new AppError('Signature webhook invalide', 401);
  }

  const { orderId: paymentId, transactionId, success } = req.body;
  if (!paymentId) throw new AppError('paymentId manquant', 400);

  const isSuccess = success === true || success === 'true' || success === 'SUCCESS' || success === 'COMPLETED';
  if (isSuccess) {
    await paymentsService.activatePayment(paymentId, transactionId);
  } else {
    await paymentsService.failPayment(paymentId);
  }
  res.json({ success: true });
}
