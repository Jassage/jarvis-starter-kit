import { z } from 'zod';

export const entreeStockSchema = z.object({
  body: z.object({
    produitId: z.string().min(1, 'Produit requis'),
    numeroLot: z.string().min(1, 'Numéro de lot requis'),
    dateExpiration: z.coerce.date(),
    quantite: z.coerce.number().int().positive('La quantité doit être positive'),
    prixAchatUnitaire: z.coerce.number().nonnegative(),
    fournisseurId: z.string().optional(),
  }),
});

export const ajustementStockSchema = z.object({
  body: z.object({
    lotId: z.string().min(1, 'Lot requis'),
    delta: z.coerce.number().int().refine((v) => v !== 0, 'La quantité ne peut pas être nulle'),
    motif: z.string().min(1, 'Le motif est requis'),
  }),
});

export const listMouvementsQuerySchema = z.object({
  query: z.object({
    produitId: z.string().optional(),
    limit: z.coerce.number().int().positive().max(200).default(50),
  }),
});

export const alertesPeremptionQuerySchema = z.object({
  query: z.object({
    joursSeuil: z.coerce.number().int().positive().default(90),
  }),
});
