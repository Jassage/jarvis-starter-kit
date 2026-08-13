import { z } from 'zod';

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Email invalide'),
    motDePasse: z.string().min(1, 'Mot de passe requis'),
  }),
  query: z.object({}).optional(),
  params: z.object({}).optional(),
});
