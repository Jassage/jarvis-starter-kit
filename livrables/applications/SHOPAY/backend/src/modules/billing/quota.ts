import prisma from '../../config/database';
import { AppError } from '../../types';
import { PLAN_LIMITS } from '../../config/plans';

// Un abonnement payant expiré retombe silencieusement en FREE dès la prochaine lecture,
// pas de job planifié requis pour cette dégradation (le cron d'expiration ne fait qu'anticiper l'effet).
export async function getEffectivePlan(boutiqueId: string) {
  const subscription = await prisma.merchantSubscription.findUnique({ where: { boutiqueId } });
  if (!subscription) return 'FREE' as const;

  const expired = subscription.plan !== 'FREE' && subscription.expiresAt && subscription.expiresAt < new Date();
  if (expired) {
    await prisma.merchantSubscription.update({ where: { boutiqueId }, data: { plan: 'FREE', expiresAt: null } });
    return 'FREE' as const;
  }
  return subscription.plan;
}

export async function assertProductQuota(boutiqueId: string): Promise<void> {
  const plan = await getEffectivePlan(boutiqueId);
  const limit = PLAN_LIMITS[plan].maxProducts;
  if (limit === Infinity) return;

  const count = await prisma.product.count({ where: { boutiqueId } });
  if (count >= limit) {
    throw new AppError(
      `Limite du plan ${PLAN_LIMITS[plan].label} atteinte (${limit} produit${limit > 1 ? 's' : ''} max). Passez à un plan supérieur.`,
      403
    );
  }
}
