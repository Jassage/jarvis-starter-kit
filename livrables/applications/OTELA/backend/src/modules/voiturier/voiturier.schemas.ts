import { z } from 'zod';

export const enregistrerVehiculeSchema = z.object({
  body: z.object({
    chambreId: z.string(),
    plaqueImmatriculation: z.string().min(1).max(30),
    emplacement: z.string().min(1).max(50),
  }),
});

export const marquerDepartSchema = z.object({
  body: z.object({
    montant: z.number().positive().optional(),
  }),
});
