import { z } from 'zod';

export const orderCheckoutSessionSchema = z.object({
  body: z.object({ orderId: z.string().min(1) }),
});

export const orderMoncashInitiateSchema = z.object({
  body: z.object({ orderId: z.string().min(1) }),
});

export const submitOrderProofSchema = z.object({
  body: z.object({
    orderId: z.string().min(1),
    transactionRef: z.string().min(1),
    senderName: z.string().optional(),
    senderNumber: z.string().optional(),
    note: z.string().optional(),
  }),
});
