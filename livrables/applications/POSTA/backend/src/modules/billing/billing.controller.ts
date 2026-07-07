import { Response } from 'express';
import * as billingService from './billing.service';
import * as stripeService from './stripe.service';
import { sendSuccess } from '../../utils/response';
import { AuthRequest } from '../../types';
import { logAudit } from '../../utils/audit';
import { PLAN_LIMITS } from '../../config/plans';

export async function getPlans(req: AuthRequest, res: Response) {
  sendSuccess(res, { plans: PLAN_LIMITS });
}

export async function getSubscription(req: AuthRequest, res: Response) {
  const overview = await billingService.getSubscriptionOverview(req.user!.userId);
  sendSuccess(res, overview);
}

export async function initiateMoncash(req: AuthRequest, res: Response) {
  const result = await billingService.initiateMoncashPayment(req.user!.userId, req.body.plan);
  sendSuccess(res, result, 'Paiement initié, suivez les instructions MonCash', 201);
}

export async function submitMoncashProof(req: AuthRequest, res: Response) {
  const payment = await billingService.submitMoncashProof(
    req.user!.userId,
    req.body.paymentId,
    req.body.referenceTransaction
  );
  sendSuccess(res, { payment }, 'Preuve envoyée, en attente de validation par un administrateur');
}

export async function listPendingPayments(req: AuthRequest, res: Response) {
  const payments = await billingService.listPendingPayments();
  sendSuccess(res, { payments });
}

export async function approvePayment(req: AuthRequest, res: Response) {
  const payment = await billingService.approvePayment(req.params.id, req.user!.userId);
  await logAudit({
    req,
    action: 'PAIEMENT_VALIDE',
    entite: 'Payment',
    entiteId: payment.id,
    changes: { plan: payment.plan, montantHtg: payment.montantHtg },
  });
  sendSuccess(res, { payment }, 'Paiement validé, abonnement activé');
}

export async function rejectPayment(req: AuthRequest, res: Response) {
  const payment = await billingService.rejectPayment(req.params.id, req.user!.userId);
  await logAudit({
    req,
    action: 'PAIEMENT_REJETE',
    entite: 'Payment',
    entiteId: payment.id,
    changes: { plan: payment.plan },
  });
  sendSuccess(res, { payment }, 'Paiement rejeté');
}

export async function createCheckoutSession(req: AuthRequest, res: Response) {
  const url = await stripeService.createCheckoutSession(req.user!.userId, req.body.plan);
  sendSuccess(res, { url }, 'Session de paiement créée', 201);
}

export async function stripeWebhook(req: AuthRequest, res: Response) {
  const signature = req.headers['stripe-signature'] as string;
  await stripeService.handleWebhook(req.body, signature);
  res.json({ received: true });
}
