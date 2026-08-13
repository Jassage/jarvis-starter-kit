import { z } from 'zod';

const CATEGORIES = ['NATURE', 'CULTURE', 'HISTOIRE', 'EVENEMENTS', 'TOURISME', 'DRONE', 'VIE_LOCALE', 'ARCHITECTURE', 'AUTRE'] as const;
const STATUTS = ['BROUILLON', 'PUBLIE', 'ARCHIVE'] as const;

const traductionSchema = z.object({
  locale: z.enum(['FR', 'HT']),
  description: z.string().min(1, 'Description requise'),
});

export const listVideosPubliqueSchema = z.object({
  body: z.object({}).optional(),
  query: z.object({
    categorie: z.enum(CATEGORIES).optional(),
  }),
  params: z.object({}).optional(),
});

export const listVideosAdminSchema = z.object({
  body: z.object({}).optional(),
  query: z.object({}).optional(),
  params: z.object({}).optional(),
});

export const createVideoSchema = z.object({
  body: z.object({
    titre: z.string().min(1).max(200),
    url: z.string().url().max(500),
    categorie: z.enum(CATEGORIES),
    miseEnAvant: z.coerce.boolean().default(false),
    statutPublication: z.enum(STATUTS).default('BROUILLON'),
    miniatureId: z.string().min(1).optional(),
    ordre: z.coerce.number().int().default(0),
    traductions: z.array(traductionSchema).min(1, 'Au moins une traduction requise'),
  }),
  query: z.object({}).optional(),
  params: z.object({}).optional(),
});

export const updateVideoSchema = z.object({
  body: z.object({
    titre: z.string().min(1).max(200).optional(),
    url: z.string().url().max(500).optional(),
    categorie: z.enum(CATEGORIES).optional(),
    miseEnAvant: z.coerce.boolean().optional(),
    statutPublication: z.enum(STATUTS).optional(),
    miniatureId: z.string().min(1).nullable().optional(),
    ordre: z.coerce.number().int().optional(),
    traductions: z.array(traductionSchema).min(1).optional(),
  }),
  query: z.object({}).optional(),
  params: z.object({
    id: z.string().min(1),
  }),
});

export const deleteVideoSchema = z.object({
  body: z.object({}).optional(),
  query: z.object({}).optional(),
  params: z.object({
    id: z.string().min(1),
  }),
});
