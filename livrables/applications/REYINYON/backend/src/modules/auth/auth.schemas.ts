import { z } from 'zod';

export const registerSchema = z.object({
  body: z.object({
    nom: z.string().min(2, 'Nom trop court'),
    email: z.string().email('Email invalide'),
    password: z.string().min(8, 'Le mot de passe doit contenir au moins 8 caractères'),
    telephone: z.string().optional(),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Email invalide'),
    password: z.string().min(1, 'Mot de passe requis'),
  }),
});
