import { z } from 'zod';

const clientSchema = z.object({
  nom: z.string().min(2).max(150),
  telephone: z.string().min(6).max(30),
  email: z.string().email(),
});

// Utilisé tel quel par le site public ET par la création manuelle back-office —
// un seul schéma, un seul service, pour ne jamais avoir deux chemins de validation
// divergents sur le point le plus critique (anti-double-booking).
export const creerReservationSchema = z.object({
  body: z.object({
    etablissementId: z.string().min(1),
    chambreId: z.string().min(1).optional(),
    typeChambreId: z.string().min(1).optional(),
    dateArrivee: z.coerce.date(),
    dateDepart: z.coerce.date(),
    nombrePersonnes: z.number().int().min(1).max(20),
    devise: z.enum(['HTG', 'USD']),
    typeSejour: z.enum(['NUITEE', 'JOUR']).default('NUITEE'),
    client: clientSchema,
  }).refine((d) => d.chambreId || d.typeChambreId, {
    message: 'chambreId ou typeChambreId requis',
    path: ['typeChambreId'],
  }),
});

export const listReservationsQuerySchema = z.object({
  query: z.object({
    etablissementId: z.string().optional(),
    statut: z.enum(['CONFIRMEE', 'EN_ATTENTE', 'ANNULEE', 'TERMINEE', 'NO_SHOW']).optional(),
    search: z.string().optional(),
    from: z.coerce.date().optional(),
    to: z.coerce.date().optional(),
  }),
});
