import { z } from 'zod';

const ligneTransfertSchema = z.object({
  produitId: z.string().min(1, 'Produit requis'),
  quantite: z.coerce.number().int().positive('Quantité > 0'),
});

export const createTransfertSchema = z
  .object({
    emplacementSourceId: z.string().min(1, 'Emplacement source requis'),
    emplacementDestId: z.string().min(1, 'Emplacement de destination requis'),
    notes: z.string().max(500).optional(),
    lignes: z.array(ligneTransfertSchema).min(1, 'Au moins une ligne requise'),
  })
  .refine((data) => data.emplacementSourceId !== data.emplacementDestId, {
    message: 'La source et la destination doivent être différentes',
    path: ['emplacementDestId'],
  });
