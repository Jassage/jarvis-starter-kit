import { z } from 'zod';

export const createProduitSchema = z.object({
  reference: z.string().min(1, 'Référence requise').max(50),
  nom: z.string().min(1, 'Nom requis').max(150),
  categorie: z.string().max(100).optional(),
  unite: z.string().min(1).max(30).default('unité'),
  prixAchatMoyen: z.coerce.number().min(0).default(0),
  prixVenteDetail: z.coerce.number().positive('Le prix de vente détail doit être positif'),
  prixVenteGros: z.coerce.number().positive().optional(),
  seuilAlerte: z.coerce.number().int().min(0).default(0),
});

export const updateProduitSchema = createProduitSchema.partial();
