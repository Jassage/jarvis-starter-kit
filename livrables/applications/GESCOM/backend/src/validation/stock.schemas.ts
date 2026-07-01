import { z } from 'zod';

export const ajustementStockSchema = z.object({
  produitId: z.string().min(1, 'Produit requis'),
  emplacementId: z.string().min(1, 'Emplacement requis'),
  quantite: z.coerce.number().int().refine((v) => v !== 0, 'La quantité ne peut pas être nulle'),
  type: z.enum(['ENTREE', 'AJUSTEMENT']),
  raison: z.string().max(255).optional(),
});
