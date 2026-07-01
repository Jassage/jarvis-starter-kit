import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Email invalide').max(254),
  motDePasse: z.string().min(1, 'Mot de passe requis').max(128),
});

export const refreshSchema = z.object({
  refreshToken: z.string().min(10, 'Refresh token invalide').optional(),
});

const motDePasseComplexe = z
  .string()
  .min(8, 'Minimum 8 caractères')
  .max(128)
  .regex(/[a-z]/, 'Doit contenir au moins une minuscule')
  .regex(/[A-Z]/, 'Doit contenir au moins une majuscule')
  .regex(/[0-9]/, 'Doit contenir au moins un chiffre');

export const changePasswordSchema = z.object({
  ancienMotDePasse: z.string().min(1, 'Ancien mot de passe requis'),
  nouveauMotDePasse: motDePasseComplexe,
});

export const createUtilisateurSchema = z.object({
  email: z.string().email('Email invalide').max(254),
  motDePasse: z.string().min(8, 'Mot de passe : 8 caractères minimum').max(128),
  nom: z.string().min(1).max(100).trim(),
  prenom: z.string().min(1).max(100).trim(),
  role: z.enum(['SUPER_ADMIN', 'GERANT', 'VENDEUR', 'MAGASINIER', 'COMPTABLE']),
  emplacementId: z.string().cuid().optional(),
  telephone: z.string().max(20).optional(),
});
