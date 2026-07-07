import { z } from 'zod';

const localPartRegex = /^[a-z0-9](?:[a-z0-9._-]{0,62}[a-z0-9])?$/i;

export const createMailboxSchema = z.object({
  body: z.object({
    localPart: z.string().trim().min(1).max(64).regex(localPartRegex, 'Partie locale invalide'),
    motDePasse: z.string().min(8, 'Le mot de passe doit contenir au moins 8 caractères'),
    quotaMb: z.number().int().positive().optional(),
  }),
  query: z.object({}).optional(),
  params: z.object({ domainId: z.string().min(1) }),
});

export const updateMailboxSchema = z.object({
  body: z.object({
    motDePasse: z.string().min(8).optional(),
    quotaMb: z.number().int().positive().optional(),
    actif: z.boolean().optional(),
  }),
  query: z.object({}).optional(),
  params: z.object({ domainId: z.string().min(1), id: z.string().min(1) }),
});

export const mailboxIdParamSchema = z.object({
  body: z.object({}).optional(),
  query: z.object({}).optional(),
  params: z.object({ domainId: z.string().min(1), id: z.string().min(1) }),
});

export const domainScopeParamSchema = z.object({
  body: z.object({}).optional(),
  query: z.object({}).optional(),
  params: z.object({ domainId: z.string().min(1) }),
});
