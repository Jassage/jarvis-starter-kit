import { z } from 'zod';

export const creerCommandeSchema = z.object({
  body: z.object({
    fournisseurId: z.string().min(1, 'Fournisseur requis'),
    lignes: z
      .array(
        z.object({
          produitId: z.string().min(1),
          quantiteCommandee: z.coerce.number().int().positive('La quantité doit être positive'),
          prixUnitaire: z.coerce.number().nonnegative(),
        })
      )
      .min(1, 'Au moins une ligne est requise'),
  }),
});

export const recevoirCommandeSchema = z.object({
  params: z.object({ id: z.string().min(1) }),
  body: z.object({
    lignes: z
      .array(
        z.object({
          ligneId: z.string().min(1),
          quantiteRecue: z.coerce.number().int().positive('La quantité reçue doit être positive'),
          numeroLot: z.string().min(1, 'Numéro de lot requis'),
          dateExpiration: z.coerce.date(),
          prixAchatUnitaire: z.coerce.number().nonnegative().optional(),
        })
      )
      .min(1, 'Au moins une ligne à réceptionner est requise'),
  }),
});

export const idParamSchema = z.object({
  params: z.object({ id: z.string().min(1) }),
});

export const listCommandesQuerySchema = z.object({
  query: z.object({
    limit: z.coerce.number().int().positive().max(200).default(50),
    statut: z.enum(['BROUILLON', 'ENVOYEE', 'RECUE_PARTIELLE', 'RECUE_COMPLETE', 'ANNULEE']).optional(),
    fournisseurId: z.string().optional(),
  }),
});
