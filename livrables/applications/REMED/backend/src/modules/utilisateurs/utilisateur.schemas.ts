import { z } from 'zod';

const roleEnum = z.enum(['SUPER_ADMIN', 'GERANT', 'PHARMACIEN', 'VENDEUR', 'MAGASINIER']);

export const creerUtilisateurSchema = z.object({
  body: z.object({
    email: z.string().email('Email invalide'),
    motDePasse: z.string().min(8, 'Le mot de passe doit contenir au moins 8 caractères'),
    nom: z.string().min(1, 'Nom requis'),
    prenom: z.string().min(1, 'Prénom requis'),
    telephone: z.string().optional(),
    role: roleEnum,
  }),
});

export const updateUtilisateurSchema = z.object({
  params: z.object({ id: z.string().min(1) }),
  body: z.object({
    nom: z.string().min(1).optional(),
    prenom: z.string().min(1).optional(),
    telephone: z.string().optional(),
    role: roleEnum.optional(),
    actif: z.boolean().optional(),
  }),
});

export const resetPasswordSchema = z.object({
  params: z.object({ id: z.string().min(1) }),
  body: z.object({
    nouveauMotDePasse: z.string().min(8, 'Le mot de passe doit contenir au moins 8 caractères'),
  }),
});

export const idParamSchema = z.object({
  params: z.object({ id: z.string().min(1) }),
});
