import { PlanType } from '@prisma/client';
import prisma from '../../config/database';
import { AppError } from '../../types';
import { PLAN_LIMITS } from '../../config/plans';

// Un abonnement payant expiré retombe silencieusement en FREE dès la prochaine lecture,
// sans job planifié : POSTA n'a pas d'infra de queue (BullMQ/Redis), contrairement à LAKAY.
export async function getEffectivePlan(userId: string): Promise<PlanType> {
  const subscription = await prisma.subscription.findUnique({ where: { userId } });
  if (!subscription) return 'FREE';

  const expire = subscription.plan !== 'FREE' && subscription.expiresAt && subscription.expiresAt < new Date();
  if (expire) {
    await prisma.subscription.update({ where: { userId }, data: { plan: 'FREE', expiresAt: null } });
    return 'FREE';
  }
  return subscription.plan;
}

async function isSuperAdmin(userId: string): Promise<boolean> {
  const utilisateur = await prisma.utilisateur.findUnique({ where: { id: userId }, select: { role: true } });
  return utilisateur?.role === 'SUPER_ADMIN';
}

export async function assertDomainQuota(userId: string): Promise<void> {
  if (await isSuperAdmin(userId)) return; // l'opérateur de la plateforme n'est pas soumis aux quotas
  const plan = await getEffectivePlan(userId);
  const limite = PLAN_LIMITS[plan].maxDomaines;
  if (limite === Infinity) return;

  const count = await prisma.domain.count({ where: { ownerId: userId } });
  if (count >= limite) {
    throw new AppError(
      403,
      `Limite du plan ${PLAN_LIMITS[plan].label} atteinte (${limite} domaine${limite > 1 ? 's' : ''} max). Passez à un plan supérieur.`
    );
  }
}

export async function assertMailboxQuota(userId: string): Promise<void> {
  if (await isSuperAdmin(userId)) return;
  const plan = await getEffectivePlan(userId);
  const limite = PLAN_LIMITS[plan].maxMailboxesTotal;
  if (limite === Infinity) return;

  const count = await prisma.mailbox.count({ where: { domain: { ownerId: userId } } });
  if (count >= limite) {
    throw new AppError(
      403,
      `Limite du plan ${PLAN_LIMITS[plan].label} atteinte (${limite} boîte${limite > 1 ? 's' : ''} mail max). Passez à un plan supérieur.`
    );
  }
}

// Le quota de stockage par boîte est toujours résolu par rapport au plan : à défaut d'une
// valeur demandée, on applique le maximum du plan (jamais le défaut statique du schéma Prisma) ;
// une demande excessive est ramenée à la limite plutôt que rejetée.
export async function resolveMailboxQuota(userId: string, quotaMbDemande?: number): Promise<number> {
  if (await isSuperAdmin(userId)) return quotaMbDemande ?? 1024;
  const plan = await getEffectivePlan(userId);
  const maxParBoite = PLAN_LIMITS[plan].quotaMbParBoite;
  if (quotaMbDemande === undefined) return maxParBoite;
  return Math.min(quotaMbDemande, maxParBoite);
}
