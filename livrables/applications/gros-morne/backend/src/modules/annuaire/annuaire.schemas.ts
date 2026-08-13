import { z } from 'zod';

const CATEGORIES = ['BANQUE', 'EGLISE', 'ONG', 'STATION_SERVICE', 'BOUTIQUE', 'GARAGE', 'PROFESSIONNEL', 'TRANSPORT', 'AUTRE'] as const;
const STATUTS = ['BROUILLON', 'PUBLIE', 'ARCHIVE'] as const;

const traductionSchema = z.object({
  locale: z.enum(['FR', 'HT']),
  description: z.string().min(1, 'Description requise'),
});

export const listPubliqueSchema = z.object({
  body: z.object({}).optional(),
  query: z.object({ categorie: z.enum(CATEGORIES).optional() }),
  params: z.object({}).optional(),
});

const SECTEURS = ['toutes', 'entreprises', 'ecoles', 'sante', 'hotels', 'restaurants', 'banques', 'associations'] as const;

export const listToutesSchema = z.object({
  body: z.object({}).optional(),
  query: z.object({
    secteur: z.enum(SECTEURS).optional(),
    q: z.string().min(1).max(100).optional(),
  }),
  params: z.object({}).optional(),
});

export const listAdminSchema = z.object({
  body: z.object({}).optional(),
  query: z.object({}).optional(),
  params: z.object({}).optional(),
});

export const createSchema = z.object({
  body: z.object({
    nom: z.string().min(1).max(200),
    categorie: z.enum(CATEGORIES),
    adresse: z.string().max(200).optional(),
    telephone: z.string().max(50).optional(),
    whatsapp: z.string().max(50).optional(),
    email: z.string().email().max(150).optional(),
    siteWeb: z.string().max(200).optional(),
    horaires: z.string().max(150).optional(),
    latitude: z.coerce.number().min(-90).max(90).optional(),
    longitude: z.coerce.number().min(-180).max(180).optional(),
    statutPublication: z.enum(STATUTS).default('BROUILLON'),
    photoId: z.string().min(1).optional(),
    ordre: z.coerce.number().int().default(0),
    traductions: z.array(traductionSchema).min(1, 'Au moins une traduction requise'),
  }),
  query: z.object({}).optional(),
  params: z.object({}).optional(),
});

export const updateSchema = z.object({
  body: z.object({
    nom: z.string().min(1).max(200).optional(),
    categorie: z.enum(CATEGORIES).optional(),
    adresse: z.string().max(200).nullable().optional(),
    telephone: z.string().max(50).nullable().optional(),
    whatsapp: z.string().max(50).nullable().optional(),
    email: z.string().email().max(150).nullable().optional(),
    siteWeb: z.string().max(200).nullable().optional(),
    horaires: z.string().max(150).nullable().optional(),
    latitude: z.coerce.number().min(-90).max(90).nullable().optional(),
    longitude: z.coerce.number().min(-180).max(180).nullable().optional(),
    statutPublication: z.enum(STATUTS).optional(),
    photoId: z.string().min(1).nullable().optional(),
    ordre: z.coerce.number().int().optional(),
    traductions: z.array(traductionSchema).min(1).optional(),
  }),
  query: z.object({}).optional(),
  params: z.object({ id: z.string().min(1) }),
});

export const deleteSchema = z.object({
  body: z.object({}).optional(),
  query: z.object({}).optional(),
  params: z.object({ id: z.string().min(1) }),
});
