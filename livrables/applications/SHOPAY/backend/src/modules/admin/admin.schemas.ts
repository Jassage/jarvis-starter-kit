import { z } from 'zod';

export const updateBoutiqueStatusSchema = z.object({
  body: z.object({ status: z.enum(['ACTIVE', 'SUSPENDED']) }),
});

export const rejectPaymentSchema = z.object({
  body: z.object({ reason: z.string().optional() }),
});
