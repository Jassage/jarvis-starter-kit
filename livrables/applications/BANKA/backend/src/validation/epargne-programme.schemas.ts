import { z } from 'zod';

export const createEpargneSchema = z.object({
  compteSourceId: z.string().cuid('Compte source invalide'),
  compteDestId: z.string().cuid('Compte destination invalide'),
  montant: z.number().positive('Le montant doit être positif'),
  frequence: z.enum(['HEBDOMADAIRE', 'MENSUEL', 'BIMESTRIEL', 'TRIMESTRIEL']),
  prochainVersement: z.coerce.date(),
  notes: z.string().max(1000).optional(),
}).refine((d) => d.compteSourceId !== d.compteDestId, {
  message: 'Le compte source et le compte destination doivent être différents',
});
