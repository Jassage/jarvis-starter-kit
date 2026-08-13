import { z } from 'zod';

export const listActivityLogSchema = z.object({
  body: z.object({}).optional(),
  query: z.object({
    entite: z.string().min(1).max(100).optional(),
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(50),
  }),
  params: z.object({}).optional(),
});
