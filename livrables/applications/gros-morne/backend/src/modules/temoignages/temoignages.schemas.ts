import { z } from 'zod';

const STATUTS = ['BROUILLON', 'PUBLIE', 'ARCHIVE'] as const;

const traductionSchema = z.object({
  locale: z.enum(['FR', 'HT']),
  contenu: z.string().min(1, 'Contenu requis'),
});

export const listTemoignagesPubliqueSchema = z.object({
  body: z.object({}).optional(),
  query: z.object({}).optional(),
  params: z.object({}).optional(),
});

export const listTemoignagesAdminSchema = z.object({
  body: z.object({}).optional(),
  query: z.object({}).optional(),
  params: z.object({}).optional(),
});

export const createTemoignageSchema = z.object({
  body: z.object({
    nom: z.string().min(1).max(150),
    fonction: z.string().max(150).optional(),
    photoId: z.string().min(1).optional(),
    note: z.coerce.number().int().min(1).max(5).optional(),
    statutPublication: z.enum(STATUTS).default('BROUILLON'),
    ordre: z.coerce.number().int().default(0),
    traductions: z.array(traductionSchema).min(1, 'Au moins une traduction requise'),
  }),
  query: z.object({}).optional(),
  params: z.object({}).optional(),
});

export const updateTemoignageSchema = z.object({
  body: z.object({
    nom: z.string().min(1).max(150).optional(),
    fonction: z.string().max(150).nullable().optional(),
    photoId: z.string().min(1).nullable().optional(),
    note: z.coerce.number().int().min(1).max(5).nullable().optional(),
    statutPublication: z.enum(STATUTS).optional(),
    ordre: z.coerce.number().int().optional(),
    traductions: z.array(traductionSchema).min(1).optional(),
  }),
  query: z.object({}).optional(),
  params: z.object({
    id: z.string().min(1),
  }),
});

export const deleteTemoignageSchema = z.object({
  body: z.object({}).optional(),
  query: z.object({}).optional(),
  params: z.object({
    id: z.string().min(1),
  }),
});
