import { z } from 'zod';

export const enregistrerPaiementSchema = z.object({
  body: z.object({
    montant: z.number().positive(),
    methode: z.enum(['ESPECES', 'CARTE', 'MONCASH', 'AUTRE']),
  }),
});
