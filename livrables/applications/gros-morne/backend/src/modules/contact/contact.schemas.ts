import { z } from 'zod';

const STATUTS = ['NOUVEAU', 'LU', 'TRAITE', 'ARCHIVE'] as const;

export const createMessageContactSchema = z.object({
  body: z.object({
    nom: z.string().min(1, 'Nom requis').max(150),
    email: z.string().email('Email invalide').max(200),
    telephone: z.string().max(50).optional(),
    sujet: z.string().max(200).optional(),
    message: z.string().min(1, 'Message requis').max(5000),
  }),
  query: z.object({}).optional(),
  params: z.object({}).optional(),
});

export const listMessagesContactSchema = z.object({
  body: z.object({}).optional(),
  query: z.object({
    statut: z.enum(STATUTS).optional(),
  }),
  params: z.object({}).optional(),
});

export const updateStatutMessageContactSchema = z.object({
  body: z.object({
    statut: z.enum(STATUTS),
  }),
  query: z.object({}).optional(),
  params: z.object({
    id: z.string().min(1),
  }),
});

export const deleteMessageContactSchema = z.object({
  body: z.object({}).optional(),
  query: z.object({}).optional(),
  params: z.object({
    id: z.string().min(1),
  }),
});
