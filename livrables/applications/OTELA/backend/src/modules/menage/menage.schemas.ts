import { z } from 'zod';

export const updateTacheSchema = z.object({
  body: z.object({
    statut: z.enum(['A_FAIRE', 'EN_COURS', 'TERMINE']).optional(),
    employeAssigneId: z.string().nullable().optional(),
  }),
});

export const listTachesQuerySchema = z.object({
  query: z.object({
    statut: z.enum(['A_FAIRE', 'EN_COURS', 'TERMINE']).optional(),
  }),
});
