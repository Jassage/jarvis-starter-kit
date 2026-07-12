import { z } from 'zod';

export const envoyerMessageSchema = z.object({
  body: z.object({
    participantId: z.string().min(1),
    reconnectToken: z.string().min(1),
    contenu: z.string().min(1).max(2000),
  }),
});

export const historiqueMessageSchema = z.object({
  query: z.object({
    participantId: z.string().min(1),
    reconnectToken: z.string().min(1),
  }),
});
