import { z } from 'zod';

export const createUserSchema = z.object({
  body: z.object({
    email: z.string().email('Email invalide'),
    nom: z.string().trim().min(1).max(100),
    prenom: z.string().trim().min(1).max(100),
  }),
  query: z.object({}).optional(),
  params: z.object({}).optional(),
});

export const updateUserActifSchema = z.object({
  body: z.object({ actif: z.boolean() }),
  query: z.object({}).optional(),
  params: z.object({ id: z.string().min(1) }),
});
