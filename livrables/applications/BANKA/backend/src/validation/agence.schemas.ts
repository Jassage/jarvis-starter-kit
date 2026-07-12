import { z } from 'zod';

export const createAgenceSchema = z.object({
  code: z.string().min(1, 'Code requis').max(20).trim(),
  nom: z.string().min(1, 'Nom requis').max(200).trim(),
  adresse: z.string().max(500).optional(),
  telephone: z.string().max(20).optional(),
  plafondCaisseHTG: z.number().min(0).optional(),
});

export const updateAgenceSchema = z.object({
  nom: z.string().min(1).max(200).trim().optional(),
  adresse: z.string().max(500).optional(),
  telephone: z.string().max(20).optional(),
  actif: z.boolean().optional(),
  plafondCaisseHTG: z.number().min(0).nullable().optional(),
});
