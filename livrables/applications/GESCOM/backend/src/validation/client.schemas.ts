import { z } from 'zod';

export const createClientSchema = z.object({
  nom: z.string().min(1, 'Nom requis').max(150),
  telephone: z.string().max(20).optional(),
  adresse: z.string().max(255).optional(),
  type: z.enum(['PARTICULIER', 'GROSSISTE']).default('PARTICULIER'),
});

export const updateClientSchema = createClientSchema.partial();
