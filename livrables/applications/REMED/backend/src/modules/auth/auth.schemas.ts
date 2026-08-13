import { z } from 'zod';

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email("Email invalide"),
    motDePasse: z.string().min(1, 'Mot de passe requis'),
  }),
});

export const forgotPasswordSchema = z.object({
  body: z.object({
    email: z.string().email('Email invalide'),
  }),
});

export const resetPasswordSchema = z.object({
  body: z.object({
    token: z.string().min(1, 'Token requis'),
    motDePasse: z.string().min(8, 'Le mot de passe doit contenir au moins 8 caractères'),
  }),
});
