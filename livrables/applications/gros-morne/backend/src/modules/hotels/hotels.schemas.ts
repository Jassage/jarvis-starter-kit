import { z } from 'zod';

const STATUTS = ['BROUILLON', 'PUBLIE', 'ARCHIVE'] as const;

const traductionSchema = z.object({
  locale: z.enum(['FR', 'HT']),
  description: z.string().min(1, 'Description requise'),
});

export const listPubliqueSchema = z.object({
  body: z.object({}).optional(),
  query: z.object({}).optional(),
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
    nombreChambres: z.coerce.number().int().nonnegative().optional(),
    servicesDisponibles: z.array(z.string().min(1)).default([]),
    prixMin: z.coerce.number().int().nonnegative().optional(),
    prixMax: z.coerce.number().int().nonnegative().optional(),
    adresse: z.string().max(200).optional(),
    telephone: z.string().max(50).optional(),
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
    nombreChambres: z.coerce.number().int().nonnegative().nullable().optional(),
    servicesDisponibles: z.array(z.string().min(1)).optional(),
    prixMin: z.coerce.number().int().nonnegative().nullable().optional(),
    prixMax: z.coerce.number().int().nonnegative().nullable().optional(),
    adresse: z.string().max(200).nullable().optional(),
    telephone: z.string().max(50).nullable().optional(),
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
