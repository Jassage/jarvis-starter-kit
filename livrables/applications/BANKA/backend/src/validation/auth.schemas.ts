import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Email invalide').max(254),
  motDePasse: z.string().min(1, 'Mot de passe requis').max(128),
});

export const refreshSchema = z.object({
  refreshToken: z.string().min(10, 'Refresh token invalide'),
});

const motDePasseComplexe = z
  .string()
  .min(12, 'Minimum 12 caractères')
  .max(128)
  .regex(/[a-z]/, 'Doit contenir au moins une minuscule')
  .regex(/[A-Z]/, 'Doit contenir au moins une majuscule')
  .regex(/[0-9]/, 'Doit contenir au moins un chiffre')
  .regex(/[^A-Za-z0-9]/, 'Doit contenir au moins un caractère spécial');

export const changePasswordSchema = z.object({
  ancienMotDePasse: z.string().min(1, 'Ancien mot de passe requis'),
  nouveauMotDePasse: motDePasseComplexe,
});

export const requestPasswordResetSchema = z.object({
  email: z.string().email('Email invalide').max(254),
});

export const confirmPasswordResetSchema = z.object({
  token: z.string().length(64, 'Token invalide'),
  nouveauMotDePasse: motDePasseComplexe,
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

// Whitelist stricte : motDePasse, email, twoFactorSecret, twoFactorEnabled sont volontairement
// exclus — ils ne doivent être modifiables que via les flux dédiés (changePassword, 2FA setup/enable/disable)
export const updateUtilisateurSchema = z.object({
  nom: z.string().min(1).max(100).trim().optional(),
  prenom: z.string().min(1).max(100).trim().optional(),
  telephone: z.string().max(20).optional(),
  role: z.enum(['SUPER_ADMIN', 'DIRECTEUR', 'SUPERVISEUR', 'CAISSIER', 'AGENT_CREDIT', 'COMPTABLE', 'AUDITEUR']).optional(),
  agenceId: z.string().cuid().optional(),
  actif: z.boolean().optional(),
});
