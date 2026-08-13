import { z } from 'zod';

export const creerInventaireSchema = z.object({
  body: z
    .object({
      type: z.enum(['COMPLET', 'PARTIEL']),
      lotIds: z.array(z.string().min(1)).optional(),
    })
    .refine((data) => data.type !== 'PARTIEL' || (data.lotIds && data.lotIds.length > 0), {
      message: 'Sélectionnez au moins un lot pour un inventaire partiel',
      path: ['lotIds'],
    }),
});

export const saisirQuantitesSchema = z.object({
  params: z.object({ id: z.string().min(1) }),
  body: z.object({
    lignes: z
      .array(
        z.object({
          itemId: z.string().min(1),
          quantiteReelle: z.coerce.number().int().nonnegative(),
          motif: z.string().optional(),
        })
      )
      .min(1),
  }),
});

export const idParamSchema = z.object({
  params: z.object({ id: z.string().min(1) }),
});

export const listInventairesQuerySchema = z.object({
  query: z.object({
    limit: z.coerce.number().int().positive().max(200).default(50),
    statut: z.enum(['EN_COURS', 'VALIDE', 'ANNULE']).optional(),
  }),
});
