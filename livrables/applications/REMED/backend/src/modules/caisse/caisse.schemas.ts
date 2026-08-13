import { z } from 'zod';

export const ouvrirCaisseSchema = z.object({
  body: z.object({
    montantOuverture: z.coerce.number().nonnegative(),
  }),
});

export const fermerCaisseSchema = z.object({
  body: z.object({
    montantFermeture: z.coerce.number().nonnegative(),
  }),
  params: z.object({ id: z.string().min(1) }),
});

export const mouvementCaisseSchema = z.object({
  body: z.object({
    type: z.enum(['ENTREE_MANUELLE', 'SORTIE_MANUELLE']),
    montant: z.coerce.number().positive(),
    motif: z.string().min(1, 'Le motif est requis'),
  }),
});
