import { z } from 'zod';

export const upgradeSchema = z.object({
  body: z.object({
    plan: z.enum(['BASIC', 'PRO']),
    method: z.enum(['STRIPE', 'MONCASH']),
  }),
});

export const submitProofSchema = z.object({
  body: z.object({
    plan: z.enum(['BASIC', 'PRO']),
    transactionRef: z.string().min(1),
    senderName: z.string().optional(),
    senderNumber: z.string().optional(),
    note: z.string().optional(),
  }),
});
