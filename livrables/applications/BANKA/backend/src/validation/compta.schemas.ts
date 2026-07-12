import { z } from 'zod';

export const createCompteComptableSchema = z.object({
  numero: z.string().min(1, 'Numéro requis').max(20).trim(),
  intitule: z.string().min(1, 'Intitulé requis').max(200).trim(),
  type: z.enum(['ACTIF', 'PASSIF', 'CHARGE', 'PRODUIT', 'CAPITAUX']),
});

export const updateCompteComptableSchema = z.object({
  intitule: z.string().min(1).max(200).trim().optional(),
  actif: z.boolean().optional(),
});
