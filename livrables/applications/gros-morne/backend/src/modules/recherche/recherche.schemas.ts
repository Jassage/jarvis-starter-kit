import { z } from 'zod';

export const rechercheSchema = z.object({
  body: z.object({}).optional(),
  query: z.object({
    q: z.string().min(2, 'Minimum 2 caractères').max(100),
  }),
  params: z.object({}).optional(),
});
