import { z } from 'zod';
import { motDePasseSchema } from '../../utils/password';

export const createUtilisateurSchema = z.object({
  body: z.object({
    email: z.string().email('Email invalide'),
    nom: z.string().min(2, 'Nom requis').max(100),
    password: motDePasseSchema,
    role: z.enum(['ADMINISTRATEUR', 'OPERATEUR_REGIE']),
  }),
});

export const updateUtilisateurSchema = z.object({
  params: z.object({ id: z.string() }),
  body: z.object({
    nom: z.string().min(2).max(100).optional(),
    role: z.enum(['ADMINISTRATEUR', 'OPERATEUR_REGIE']).optional(),
    isActive: z.boolean().optional(),
  }),
});

export const idParamSchema = z.object({
  params: z.object({ id: z.string() }),
});
