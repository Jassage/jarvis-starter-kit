import { z } from 'zod';

const CATEGORIES = ['NATURE', 'CULTURE', 'HISTOIRE', 'EVENEMENTS', 'TOURISME', 'DRONE', 'VIE_LOCALE', 'ARCHITECTURE', 'AUTRE'] as const;
const STATUTS = ['BROUILLON', 'PUBLIE', 'ARCHIVE'] as const;

const traductionSchema = z.object({
  locale: z.enum(['FR', 'HT']),
  description: z.string().min(1, 'Description requise'),
});

const mediaItemSchema = z.object({
  id: z.string().min(1).optional(),
  mediaId: z.string().min(1).optional(),
  icone: z.string().max(10).optional(),
  titre: z.string().min(1).max(150),
  auteur: z.string().max(100).optional(),
  lieu: z.string().max(150).optional(),
  ordre: z.coerce.number().int().default(0),
});

export const listAlbumsPubliqueSchema = z.object({
  body: z.object({}).optional(),
  query: z.object({
    categorie: z.enum(CATEGORIES).optional(),
  }),
  params: z.object({}).optional(),
});

export const listAlbumsAdminSchema = z.object({
  body: z.object({}).optional(),
  query: z.object({}).optional(),
  params: z.object({}).optional(),
});

export const createAlbumSchema = z.object({
  body: z.object({
    nom: z.string().min(1).max(150),
    categorie: z.enum(CATEGORIES),
    statutPublication: z.enum(STATUTS).default('BROUILLON'),
    photoCouvertureId: z.string().min(1).optional(),
    ordre: z.coerce.number().int().default(0),
    traductions: z.array(traductionSchema).min(1, 'Au moins une traduction requise'),
    medias: z.array(mediaItemSchema).default([]),
  }),
  query: z.object({}).optional(),
  params: z.object({}).optional(),
});

export const updateAlbumSchema = z.object({
  body: z.object({
    nom: z.string().min(1).max(150).optional(),
    categorie: z.enum(CATEGORIES).optional(),
    statutPublication: z.enum(STATUTS).optional(),
    photoCouvertureId: z.string().min(1).nullable().optional(),
    ordre: z.coerce.number().int().optional(),
    traductions: z.array(traductionSchema).min(1).optional(),
    medias: z.array(mediaItemSchema).optional(),
  }),
  query: z.object({}).optional(),
  params: z.object({
    id: z.string().min(1),
  }),
});

export const deleteAlbumSchema = z.object({
  body: z.object({}).optional(),
  query: z.object({}).optional(),
  params: z.object({
    id: z.string().min(1),
  }),
});
