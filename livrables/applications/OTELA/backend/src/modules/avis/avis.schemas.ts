import { z } from 'zod';

export const soumettreAvisSchema = z.object({
  body: z.object({
    reference: z.string().min(1),
    email: z.string().email(),
    note: z.number().int().min(1).max(5),
    commentaire: z.string().optional(),
  }),
});

export const modererAvisSchema = z.object({
  body: z.object({
    visible: z.boolean().optional(),
    reponseDirection: z.string().optional(),
  }),
});
