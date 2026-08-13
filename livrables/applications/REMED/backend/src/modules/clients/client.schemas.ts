import { z } from 'zod';

export const createClientSchema = z.object({
  body: z.object({
    nom: z.string().min(1, 'Le nom est requis'),
    prenom: z.string().optional(),
    telephone: z.string().optional(),
    email: z.string().email().optional().or(z.literal('')),
    adresse: z.string().optional(),
    dateNaissance: z.coerce.date().optional(),
    sexe: z.string().optional(),
    notes: z.string().optional(),
  }),
});

export const updateClientSchema = z.object({
  body: createClientSchema.shape.body.partial(),
  params: z.object({ id: z.string().min(1) }),
});

export const listClientsQuerySchema = z.object({
  query: z.object({
    recherche: z.string().optional(),
  }),
});
