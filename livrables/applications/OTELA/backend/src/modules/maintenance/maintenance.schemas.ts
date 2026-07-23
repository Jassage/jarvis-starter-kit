import { z } from 'zod';

// Exactement l'un des deux : une chambre ou une zone commune, jamais les deux, jamais
// aucun des deux — impossible à exprimer en contrainte Prisma, donc porté ici.
const creerTicketBody = z
  .object({
    chambreId: z.string().optional(),
    zone: z.string().min(1).optional(),
    titre: z.string().min(1),
    description: z.string().optional(),
    priorite: z.enum(['BASSE', 'NORMALE', 'HAUTE', 'URGENTE']).optional(),
    bloqueChambre: z.boolean().optional(),
  })
  .refine((d) => Boolean(d.chambreId) !== Boolean(d.zone), {
    message: 'Indiquez soit une chambre, soit une zone (jamais les deux, jamais aucune des deux)',
  });

export const creerTicketSchema = z.object({ body: creerTicketBody });

export const updateTicketSchema = z.object({
  body: z.object({
    statut: z.enum(['A_FAIRE', 'EN_COURS', 'RESOLU']).optional(),
    employeAssigneId: z.string().nullable().optional(),
    priorite: z.enum(['BASSE', 'NORMALE', 'HAUTE', 'URGENTE']).optional(),
    notesResolution: z.string().optional(),
  }),
});

export const listTicketsQuerySchema = z.object({
  query: z.object({
    statut: z.enum(['A_FAIRE', 'EN_COURS', 'RESOLU']).optional(),
  }),
});
