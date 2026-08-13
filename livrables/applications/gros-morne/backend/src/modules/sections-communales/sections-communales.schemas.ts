import { z } from 'zod';

const traductionSchema = z.object({
  locale: z.enum(['FR', 'HT']),
  description: z.string().min(1, 'Description requise'),
  activitesPrincipales: z.array(z.string().min(1)).default([]),
});

export const listSectionsCommunalesSchema = z.object({
  body: z.object({}).optional(),
  query: z.object({}).optional(),
  params: z.object({}).optional(),
});

export const createSectionCommunaleSchema = z.object({
  body: z.object({
    nom: z.string().min(1).max(150),
    principale: z.coerce.boolean().default(false),
    couleur: z.string().min(1).max(100),
    population: z.coerce.number().int().nonnegative().optional(),
    photoUrl: z.string().max(500).optional(),
    ordre: z.coerce.number().int().default(0),
    traductions: z.array(traductionSchema).min(1, 'Au moins une traduction requise'),
  }),
  query: z.object({}).optional(),
  params: z.object({}).optional(),
});

export const updateSectionCommunaleSchema = z.object({
  body: z.object({
    nom: z.string().min(1).max(150).optional(),
    principale: z.coerce.boolean().optional(),
    couleur: z.string().min(1).max(100).optional(),
    population: z.coerce.number().int().nonnegative().nullable().optional(),
    photoUrl: z.string().max(500).nullable().optional(),
    ordre: z.coerce.number().int().optional(),
    traductions: z.array(traductionSchema).min(1).optional(),
  }),
  query: z.object({}).optional(),
  params: z.object({
    id: z.string().min(1),
  }),
});

export const deleteSectionCommunaleSchema = z.object({
  body: z.object({}).optional(),
  query: z.object({}).optional(),
  params: z.object({
    id: z.string().min(1),
  }),
});
