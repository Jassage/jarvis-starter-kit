import { z } from 'zod';

// FREE n'est jamais sélectionnable ici : c'est le plan par défaut, pas un achat.
const planEnum = z.enum(['STARTER', 'PRO', 'BUSINESS']);

export const initiateMoncashSchema = z.object({
  body: z.object({ plan: planEnum }),
  query: z.object({}).optional(),
  params: z.object({}).optional(),
});

export const submitProofSchema = z.object({
  body: z.object({
    paymentId: z.string().min(1),
    referenceTransaction: z.string().trim().min(1).max(100),
  }),
  query: z.object({}).optional(),
  params: z.object({}).optional(),
});

export const checkoutSchema = z.object({
  body: z.object({ plan: planEnum }),
  query: z.object({}).optional(),
  params: z.object({}).optional(),
});

export const paymentIdParamSchema = z.object({
  body: z.object({}).optional(),
  query: z.object({}).optional(),
  params: z.object({ id: z.string().min(1) }),
});
