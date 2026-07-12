import { z } from 'zod';

export const creerDemandeSchema = z.object({
  body: z.object({
    chambreId: z.string(),
    description: z.string().min(1).max(500),
  }),
});

export const assignerSchema = z.object({
  body: z.object({
    employeAssigneId: z.string(),
  }),
});

export const terminerSchema = z.object({
  body: z.object({
    montant: z.number().positive().optional(),
  }),
});
