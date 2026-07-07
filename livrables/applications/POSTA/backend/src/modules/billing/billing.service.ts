import { PlanType } from '@prisma/client';
import prisma from '../../config/database';
import { env } from '../../config/env';
import { AppError } from '../../types';
import { PLAN_LIMITS } from '../../config/plans';
import { getEffectivePlan } from './quota';

const SUBSCRIPTION_DURATION_MS = 30 * 24 * 60 * 60 * 1000;

export async function getSubscriptionOverview(userId: string) {
  const plan = await getEffectivePlan(userId);
  const subscription = await prisma.subscription.findUnique({ where: { userId } });
  const [domaines, mailboxes] = await Promise.all([
    prisma.domain.count({ where: { ownerId: userId } }),
    prisma.mailbox.count({ where: { domain: { ownerId: userId } } }),
  ]);

  return {
    plan,
    expiresAt: subscription?.expiresAt ?? null,
    limites: PLAN_LIMITS[plan],
    usage: { domaines, mailboxes },
  };
}

export async function initiateMoncashPayment(userId: string, plan: PlanType) {
  if (plan === 'FREE') throw new AppError(400, 'Le plan Free ne nécessite aucun paiement');

  const subscription = await prisma.subscription.findUniqueOrThrow({ where: { userId } });
  const montantHtg = PLAN_LIMITS[plan].prixHtg;

  const payment = await prisma.payment.create({
    data: { subscriptionId: subscription.id, plan, montantHtg, methode: 'MONCASH' },
  });

  return {
    payment,
    instructions: {
      numero: env.PAYMENT_MONCASH_NUMBER,
      nom: env.PAYMENT_MONCASH_NAME,
      montantHtg,
    },
  };
}

export async function submitMoncashProof(userId: string, paymentId: string, referenceTransaction: string) {
  const subscription = await prisma.subscription.findUniqueOrThrow({ where: { userId } });
  const payment = await prisma.payment.findFirst({ where: { id: paymentId, subscriptionId: subscription.id } });
  if (!payment) throw new AppError(404, 'Paiement introuvable');
  if (payment.statut !== 'EN_ATTENTE') throw new AppError(409, 'Ce paiement a déjà été traité');

  return prisma.payment.update({ where: { id: payment.id }, data: { referenceTransaction } });
}

export async function listPendingPayments() {
  return prisma.payment.findMany({
    where: { statut: 'EN_ATTENTE', methode: 'MONCASH' },
    include: { subscription: { include: { user: { select: { email: true, nom: true, prenom: true } } } } },
    orderBy: { createdAt: 'asc' },
  });
}

export async function approvePayment(paymentId: string, adminId: string) {
  const payment = await prisma.payment.findUnique({ where: { id: paymentId } });
  if (!payment) throw new AppError(404, 'Paiement introuvable');

  // Idempotence : compare-and-swap sur le statut, une seule activation possible même en cas de double-clic.
  const result = await prisma.payment.updateMany({
    where: { id: paymentId, statut: 'EN_ATTENTE' },
    data: { statut: 'VALIDE', valideParId: adminId, valideAt: new Date() },
  });
  if (result.count === 0) throw new AppError(409, 'Ce paiement a déjà été traité');

  await prisma.subscription.update({
    where: { id: payment.subscriptionId },
    data: { plan: payment.plan, expiresAt: new Date(Date.now() + SUBSCRIPTION_DURATION_MS) },
  });

  return prisma.payment.findUniqueOrThrow({ where: { id: paymentId } });
}

export async function rejectPayment(paymentId: string, adminId: string) {
  const payment = await prisma.payment.findUnique({ where: { id: paymentId } });
  if (!payment) throw new AppError(404, 'Paiement introuvable');

  const result = await prisma.payment.updateMany({
    where: { id: paymentId, statut: 'EN_ATTENTE' },
    data: { statut: 'REJETE', valideParId: adminId, valideAt: new Date() },
  });
  if (result.count === 0) throw new AppError(409, 'Ce paiement a déjà été traité');

  return prisma.payment.findUniqueOrThrow({ where: { id: paymentId } });
}
