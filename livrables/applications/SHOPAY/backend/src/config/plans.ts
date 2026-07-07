import { MerchantPlan } from '@prisma/client';

export interface PlanLimits {
  label: string;
  maxProducts: number;
  priceHtg: number;
  priceUsd: number;
}

// Illimité représenté par Infinity : jamais persisté, uniquement comparé en mémoire.
export const PLAN_LIMITS: Record<MerchantPlan, PlanLimits> = {
  FREE: { label: 'Free', maxProducts: 10, priceHtg: 0, priceUsd: 0 },
  BASIC: { label: 'Basic', maxProducts: 100, priceHtg: 1500, priceUsd: 12 },
  PRO: { label: 'Pro', maxProducts: Infinity, priceHtg: 4000, priceUsd: 32 },
};

export const PLAN_ORDER: MerchantPlan[] = ['FREE', 'BASIC', 'PRO'];

export const SUBSCRIPTION_DURATION_MS = 30 * 24 * 60 * 60 * 1000;
