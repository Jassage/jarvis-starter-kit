import { z } from 'zod';

const ligneVenteSchema = z.object({
  produitId: z.string().min(1, 'Produit requis'),
  quantite: z.coerce.number().int().positive('Quantité doit être > 0'),
  prixUnitaire: z.coerce.number().positive('Prix unitaire doit être > 0'),
});

export const createVenteSchema = z.object({
  emplacementId: z.string().min(1, 'Emplacement requis'),
  clientId: z.string().optional(),
  modePaiement: z.enum(['ESPECES', 'CHEQUE', 'VIREMENT', 'CREDIT']).default('ESPECES'),
  montantPaye: z.coerce.number().min(0).optional(),
  lignes: z.array(ligneVenteSchema).min(1, 'Au moins une ligne requise'),
});
