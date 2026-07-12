import { z } from 'zod';

const deviseEnum = z.enum(['HTG', 'USD']);

export const createEtablissementSchema = z.object({
  body: z.object({
    nom: z.string().min(2).max(150),
    adresse: z.string().min(2).max(255),
    commune: z.string().min(2).max(100),
    departement: z.string().min(2).max(100),
    devisesAcceptees: z.array(deviseEnum).min(1),
  }),
});

export const updateEtablissementSchema = z.object({
  body: z.object({
    nom: z.string().min(2).max(150).optional(),
    adresse: z.string().min(2).max(255).optional(),
    commune: z.string().min(2).max(100).optional(),
    departement: z.string().min(2).max(100).optional(),
    devisesAcceptees: z.array(deviseEnum).min(1).optional(),
    actif: z.boolean().optional(),
  }),
});
