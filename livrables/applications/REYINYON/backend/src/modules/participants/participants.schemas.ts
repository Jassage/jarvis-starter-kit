import { z } from 'zod';

export const rejoindreSchema = z.object({
  body: z.object({
    nomAffiche: z.string().min(1, 'Nom requis').max(60),
    codeAcces: z.string().optional(),
    reconnectToken: z.string().optional(),
    modeConnexion: z.enum(['VIDEO', 'AUDIO_SEUL', 'DIAL_IN_TELEPHONE']).optional(),
  }),
});

export const quitterSchema = z.object({
  body: z.object({
    reconnectToken: z.string().min(1),
  }),
});
