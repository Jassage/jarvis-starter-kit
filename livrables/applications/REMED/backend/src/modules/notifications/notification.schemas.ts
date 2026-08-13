import { z } from 'zod';

export const listNotificationsQuerySchema = z.object({
  query: z.object({
    limit: z.coerce.number().int().positive().max(100).default(30),
    lue: z.coerce.boolean().optional(),
  }),
});

export const idParamSchema = z.object({
  params: z.object({ id: z.string().min(1) }),
});
