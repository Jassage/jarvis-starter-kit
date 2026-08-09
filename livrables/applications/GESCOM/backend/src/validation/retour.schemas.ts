import { z } from 'zod';

const ligneRetourSchema = z.object({
  ligneVenteId: z.string().min(1, 'Ligne de vente requise'),
  quantite: z.coerce.number().int().positive('Quantité doit être > 0'),
});

export const createRetourSchema = z.object({
  motif: z.string().max(300).optional(),
  lignes: z.array(ligneRetourSchema).min(1, 'Au moins une ligne à retourner'),
});
