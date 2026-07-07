import { Response } from 'express';
import * as billingService from './billing.service';
import * as stripeService from '../payments/stripe.service';
import * as moncashService from '../payments/moncash.service';
import * as paymentsService from '../payments/payments.service';
import { sendSuccess } from '../../utils/response';
import { AuthRequest } from '../../types';
import { PLAN_LIMITS } from '../../config/plans';

export async function getPlans(_req: AuthRequest, res: Response) {
  sendSuccess(res, { plans: PLAN_LIMITS });
}

export async function getSubscription(req: AuthRequest, res: Response) {
  const overview = await billingService.getSubscriptionOverview(req.boutiqueId!);
  sendSuccess(res, overview);
}

export async function upgrade(req: AuthRequest, res: Response) {
  const { plan, method } = req.body;
  if (method === 'STRIPE') {
    const url = await stripeService.createSubscriptionCheckoutSession(req.boutiqueId!, plan);
    sendSuccess(res, { url }, 'Session de paiement créée', 201);
  } else {
    const result = await moncashService.initiateSubscriptionMoncash(req.boutiqueId!, plan);
    sendSuccess(res, result, 'Paiement initié, suivez les instructions MonCash', 201);
  }
}

export async function submitProof(req: AuthRequest, res: Response) {
  const { plan, transactionRef, senderName, senderNumber, note } = req.body;
  const payment = await paymentsService.submitSubscriptionProof(req.boutiqueId!, plan, {
    transactionRef,
    senderName,
    senderNumber,
    note,
    screenshot: req.file?.buffer,
  });
  sendSuccess(res, { payment }, 'Preuve reçue. Votre plan sera activé après vérification (sous 24h).', 201);
}
