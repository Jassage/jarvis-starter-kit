import { z } from 'zod';

const ROLES = ['RECEPTION', 'MENAGE', 'SERVEUR', 'ADMINISTRATEUR_ETABLISSEMENT', 'ADMINISTRATEUR_CHAINE'] as const;

export const listEmployesQuerySchema = z.object({
  query: z.object({
    etablissementId: z.string().optional(),
  }),
});

export const creerEmployeSchema = z.object({
  body: z.object({
    nom: z.string().min(1).max(150),
    email: z.string().email(),
    password: z.string().min(8),
    role: z.enum(ROLES),
    etablissementId: z.string().nullable().optional(),
  }),
});

export const updateEmployeSchema = z.object({
  body: z.object({
    nom: z.string().min(1).max(150).optional(),
    role: z.enum(ROLES).optional(),
    isActive: z.boolean().optional(),
  }),
});

export const reinitialiserMotDePasseSchema = z.object({
  body: z.object({
    nouveauMotDePasse: z.string().min(8),
  }),
});
