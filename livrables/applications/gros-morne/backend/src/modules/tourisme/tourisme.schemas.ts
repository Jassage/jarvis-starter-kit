import { z } from 'zod';

const CATEGORIES = [
  'NATURE',
  'CASCADE',
  'RIVIERE',
  'MONTAGNE',
  'GROTTE',
  'EGLISE',
  'SITE_HISTORIQUE',
  'SENTIER',
  'HEBERGEMENT',
  'RESTAURANT',
  'CULTURE',
  'EVENEMENT',
  'AUTRE',
] as const;

const STATUTS = ['BROUILLON', 'PUBLIE', 'ARCHIVE'] as const;

const traductionSchema = z.object({
  locale: z.enum(['FR', 'HT']),
  description: z.string().min(1, 'Description requise'),
  conseils: z.string().optional(),
});

export const listTourismePubliqueSchema = z.object({
  body: z.object({}).optional(),
  query: z.object({
    categorie: z.enum(CATEGORIES).optional(),
    q: z.string().min(1).max(100).optional(),
  }),
  params: z.object({}).optional(),
});

export const listTourismeAdminSchema = z.object({
  body: z.object({}).optional(),
  query: z.object({}).optional(),
  params: z.object({}).optional(),
});

export const createTourismePlaceSchema = z.object({
  body: z.object({
    nom: z.string().min(1).max(150),
    categorie: z.enum(CATEGORIES),
    duree: z.string().max(100).optional(),
    difficulte: z.string().max(50).optional(),
    tags: z.array(z.string().min(1)).default([]),
    latitude: z.coerce.number().min(-90).max(90).optional(),
    longitude: z.coerce.number().min(-180).max(180).optional(),
    horaires: z.string().max(200).optional(),
    tarif: z.string().max(150).optional(),
    telephone: z.string().max(50).optional(),
    servicesDisponibles: z.array(z.string().min(1)).default([]),
    statutPublication: z.enum(STATUTS).default('BROUILLON'),
    ordre: z.coerce.number().int().default(0),
    mediaIds: z.array(z.string().min(1)).default([]),
    traductions: z.array(traductionSchema).min(1, 'Au moins une traduction requise'),
  }),
  query: z.object({}).optional(),
  params: z.object({}).optional(),
});

export const updateTourismePlaceSchema = z.object({
  body: z.object({
    nom: z.string().min(1).max(150).optional(),
    categorie: z.enum(CATEGORIES).optional(),
    duree: z.string().max(100).nullable().optional(),
    difficulte: z.string().max(50).nullable().optional(),
    tags: z.array(z.string().min(1)).optional(),
    latitude: z.coerce.number().min(-90).max(90).nullable().optional(),
    longitude: z.coerce.number().min(-180).max(180).nullable().optional(),
    horaires: z.string().max(200).nullable().optional(),
    tarif: z.string().max(150).nullable().optional(),
    telephone: z.string().max(50).nullable().optional(),
    servicesDisponibles: z.array(z.string().min(1)).optional(),
    statutPublication: z.enum(STATUTS).optional(),
    ordre: z.coerce.number().int().optional(),
    mediaIds: z.array(z.string().min(1)).optional(),
    traductions: z.array(traductionSchema).min(1).optional(),
  }),
  query: z.object({}).optional(),
  params: z.object({
    id: z.string().min(1),
  }),
});

export const deleteTourismePlaceSchema = z.object({
  body: z.object({}).optional(),
  query: z.object({}).optional(),
  params: z.object({
    id: z.string().min(1),
  }),
});
