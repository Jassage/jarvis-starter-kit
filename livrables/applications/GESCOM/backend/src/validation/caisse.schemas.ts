import { z } from 'zod';

export const ouvrirSessionSchema = z.object({
  emplacementId: z.string().min(1, 'Emplacement requis'),
  soldeOuverture: z.coerce.number().min(0, 'Le fond de caisse ne peut pas être négatif'),
  notes: z.string().optional(),
});

export const fermerSessionSchema = z.object({
  soldeFermeture: z.coerce.number().min(0, 'Le montant compté ne peut pas être négatif'),
  notes: z.string().optional(),
});
