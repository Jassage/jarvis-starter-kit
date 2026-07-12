import { z } from 'zod';

export const creerCommandeSchema = z.object({
  body: z.object({
    chambreId: z.string(),
    articles: z.string().min(1).max(500),
    montant: z.number().positive(),
    devise: z.enum(['HTG', 'USD']),
  }),
});

export const updateStatutSchema = z.object({
  body: z.object({
    statut: z.enum(['RECUE', 'EN_TRAITEMENT', 'PRETE', 'LIVREE']),
  }),
});
