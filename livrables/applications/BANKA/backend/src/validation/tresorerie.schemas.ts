import { z } from 'zod';

export const envoyerTransfertSchema = z.object({
  agenceSourceId: z.string().cuid('Agence source invalide').nullable().optional(),
  agenceDestId: z.string().cuid('Agence destination invalide').nullable().optional(),
  devise: z.enum(['HTG', 'USD']),
  montant: z.number().positive('Le montant doit être positif'),
  notes: z.string().max(1000).optional(),
});
