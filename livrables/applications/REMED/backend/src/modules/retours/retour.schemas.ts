import { z } from 'zod';

const typeRetourEnum = z.enum(['RETOUR_CLIENT', 'RETOUR_FOURNISSEUR', 'PRODUIT_ENDOMMAGE', 'PRODUIT_EXPIRE', 'ERREUR_VENTE']);

export const creerRetourSchema = z.object({
  body: z
    .object({
      type: typeRetourEnum,
      venteId: z.string().optional(),
      fournisseurId: z.string().optional(),
      motif: z.string().optional(),
      lignes: z
        .array(
          z.object({
            produitId: z.string().min(1),
            lotId: z.string().min(1),
            quantite: z.coerce.number().int().positive('La quantité doit être positive'),
          })
        )
        .min(1, 'Au moins une ligne est requise'),
    })
    .refine((data) => data.type !== 'RETOUR_FOURNISSEUR' || !!data.fournisseurId, {
      message: 'Le fournisseur est requis pour un retour fournisseur',
      path: ['fournisseurId'],
    }),
});

export const listRetoursQuerySchema = z.object({
  query: z.object({
    limit: z.coerce.number().int().positive().max(200).default(50),
    type: typeRetourEnum.optional(),
  }),
});
