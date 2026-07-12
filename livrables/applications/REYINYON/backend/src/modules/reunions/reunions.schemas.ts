import { z } from 'zod';

export const creerReunionSchema = z.object({
  body: z.object({
    titre: z.string().min(2, 'Titre trop court'),
    dateHeurePrevue: z.coerce.date().optional(),
    codeAcces: z.string().min(4).max(12).optional(),
    salleAttenteActive: z.boolean().optional(),
    modeConnexionMinimale: z.enum(['VIDEO', 'AUDIO_SEUL', 'DIAL_IN']).optional(),
  }),
});

export const verrouillerSchema = z.object({
  body: z.object({
    verrouillee: z.boolean(),
  }),
});
