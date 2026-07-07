import prisma from '../../config/database';
import { PLAN_LIMITS } from '../../config/plans';
import { getEffectivePlan } from './quota';

export async function getSubscriptionOverview(boutiqueId: string) {
  const plan = await getEffectivePlan(boutiqueId);
  const subscription = await prisma.merchantSubscription.findUnique({ where: { boutiqueId } });
  const productCount = await prisma.product.count({ where: { boutiqueId } });

  return {
    plan,
    expiresAt: subscription?.expiresAt ?? null,
    limits: PLAN_LIMITS[plan],
    usage: { products: productCount },
  };
}
