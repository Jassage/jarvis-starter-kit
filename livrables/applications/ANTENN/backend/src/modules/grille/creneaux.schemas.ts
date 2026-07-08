import { z } from 'zod';

const typeCreneauEnum = z.enum(['PROGRAMME', 'MATCH_DIRECT', 'PUB']);

export const listCreneauxSchema = z.object({
  query: z.object({
    from: z.string().datetime().optional(),
    to: z.string().datetime().optional(),
  }),
});

export const createCreneauSchema = z.object({
  body: z.object({
    dateHeureDebut: z.string().datetime(),
    dateHeureFin: z.string().datetime(),
    typeCreneau: typeCreneauEnum,
    contenuId: z.string().optional().nullable(),
    matchId: z.string().optional().nullable(),
  }).refine((data) => new Date(data.dateHeureFin) > new Date(data.dateHeureDebut), {
    message: 'La date de fin doit être postérieure à la date de début',
    path: ['dateHeureFin'],
  }).refine((data) => data.typeCreneau !== 'MATCH_DIRECT' || !!data.matchId, {
    message: 'Un créneau de type MATCH_DIRECT doit référencer un match',
    path: ['matchId'],
  }).refine((data) => data.typeCreneau === 'MATCH_DIRECT' || !!data.contenuId, {
    message: 'Un créneau programmé ou pub doit référencer un contenu',
    path: ['contenuId'],
  }),
});

export const updateCreneauSchema = z.object({
  params: z.object({ id: z.string() }),
  body: z.object({
    dateHeureDebut: z.string().datetime().optional(),
    dateHeureFin: z.string().datetime().optional(),
    typeCreneau: typeCreneauEnum.optional(),
    contenuId: z.string().optional().nullable(),
    matchId: z.string().optional().nullable(),
  }),
});

export const idParamSchema = z.object({
  params: z.object({ id: z.string() }),
});
