import { PlanType } from '@prisma/client';

export interface PlanLimits {
  label: string;
  maxDomaines: number;
  maxMailboxesTotal: number;
  quotaMbParBoite: number;
  prixHtg: number;
}

// Illimité représenté par Infinity : jamais persisté, uniquement comparé en mémoire.
export const PLAN_LIMITS: Record<PlanType, PlanLimits> = {
  FREE: { label: 'Free', maxDomaines: 1, maxMailboxesTotal: 1, quotaMbParBoite: 250, prixHtg: 0 },
  STARTER: { label: 'Starter', maxDomaines: 1, maxMailboxesTotal: 3, quotaMbParBoite: 500, prixHtg: 500 },
  PRO: { label: 'Pro', maxDomaines: 3, maxMailboxesTotal: 10, quotaMbParBoite: 2048, prixHtg: 1500 },
  BUSINESS: {
    label: 'Business',
    maxDomaines: Infinity,
    maxMailboxesTotal: Infinity,
    quotaMbParBoite: 5120,
    prixHtg: 3500,
  },
};

export const PLAN_ORDER: PlanType[] = ['FREE', 'STARTER', 'PRO', 'BUSINESS'];

export function isPlanUpgrade(plan: PlanType): boolean {
  return plan !== 'FREE';
}
