import { z } from 'zod';

export const searchDisponibiliteSchema = z.object({
  query: z.object({
    etablissementId: z.string().optional(),
    dateArrivee: z.coerce.date(),
    dateDepart: z.coerce.date(),
    nombrePersonnes: z.coerce.number().int().min(1).max(20),
    devise: z.enum(['HTG', 'USD']),
    typeSejour: z.enum(['NUITEE', 'JOUR']).default('NUITEE'),
  }).refine((d) => d.dateDepart > d.dateArrivee, {
    message: 'La date de départ doit être après la date d\'arrivée',
    path: ['dateDepart'],
  }),
});
