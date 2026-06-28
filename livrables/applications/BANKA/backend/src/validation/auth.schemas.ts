import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Email invalide').max(254),
  motDePasse: z.string().min(1, 'Mot de passe requis').max(128),
});

export const refreshSchema = z.object({
  refreshToken: z.string().min(10, 'Refresh token invalide'),
});

export const changePasswordSchema = z.object({
  ancienMotDePasse: z.string().min(1, 'Ancien mot de passe requis'),
  nouveauMotDePasse: z
    .string()
    .min(8, 'Le nouveau mot de passe doit contenir au moins 8 caractères')
    .max(128)
    .regex(/[A-Z]/, 'Doit contenir au moins une majuscule')
    .regex(/[0-9]/, 'Doit contenir au moins un chiffre'),
});

const otpCode = z.string().regex(/^\d{6}$/, 'Code OTP à 6 chiffres requis');

export const verify2FASchema = z.object({
  tempToken: z.string().min(10, 'Token temporaire requis'),
  code: otpCode,
});

export const enable2FASchema = z.object({ code: otpCode });

export const disable2FASchema = z.object({
  motDePasse: z.string().min(1, 'Mot de passe requis'),
  code: otpCode,
});

export const createUtilisateurSchema = z.object({
  email: z.string().email('Email invalide').max(254),
  motDePasse: z.string().min(8, 'Mot de passe : 8 caractères minimum').max(128),
  nom: z.string().min(1).max(100).trim(),
  prenom: z.string().min(1).max(100).trim(),
  role: z.enum(['SUPER_ADMIN', 'DIRECTEUR', 'SUPERVISEUR', 'CAISSIER', 'AGENT_CREDIT', 'COMPTABLE', 'AUDITEUR']),
  agenceId: z.string().cuid().optional(),
  telephone: z.string().max(20).optional(),
});
