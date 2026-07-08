import { z } from 'zod';

export const createMatchSchema = z.object({
  body: z.object({
    nomEvenement: z.string().min(2, 'Nom d\'événement requis'),
    equipes: z.string().min(2, 'Équipes requises'),
    dateHeurePrevue: z.string().datetime(),
    ingestUrlRtmp: z.string().url().optional().nullable(),
    sponsorPrincipalId: z.string().optional().nullable(),
  }),
});

export const updateMatchSchema = z.object({
  params: z.object({ id: z.string() }),
  body: z.object({
    nomEvenement: z.string().min(2).optional(),
    equipes: z.string().min(2).optional(),
    dateHeurePrevue: z.string().datetime().optional(),
    ingestUrlRtmp: z.string().url().optional().nullable(),
    sponsorPrincipalId: z.string().optional().nullable(),
  }),
});

export const idParamSchema = z.object({
  params: z.object({ id: z.string() }),
});
