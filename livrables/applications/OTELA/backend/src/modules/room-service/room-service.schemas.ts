import { z } from 'zod';

export const ouvrirCommandeSchema = z.object({
  body: z.object({
    chambreId: z.string(),
  }),
});

export const ajouterLigneSchema = z.object({
  body: z.object({
    menuItemId: z.string(),
    quantite: z.number().int().positive(),
    notes: z.string().max(300).optional(),
  }),
});
