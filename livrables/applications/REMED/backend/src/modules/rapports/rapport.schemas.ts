import { z } from 'zod';

export const periodeQuerySchema = z.object({
  query: z.object({
    preset: z.enum(['jour', 'semaine', 'mois', 'annee', 'personnalisee']).default('mois'),
    debut: z.string().optional(),
    fin: z.string().optional(),
  }),
});
