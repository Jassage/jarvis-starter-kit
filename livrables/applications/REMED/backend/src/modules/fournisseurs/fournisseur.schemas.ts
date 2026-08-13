import { z } from 'zod';

export const createFournisseurSchema = z.object({
  body: z.object({
    nom: z.string().min(1, 'Le nom est requis'),
    contact: z.string().optional(),
    telephone: z.string().optional(),
    email: z.string().email().optional().or(z.literal('')),
    adresse: z.string().optional(),
  }),
});

export const updateFournisseurSchema = z.object({
  body: createFournisseurSchema.shape.body.partial().extend({
    actif: z.boolean().optional(),
  }),
  params: z.object({ id: z.string().min(1) }),
});
