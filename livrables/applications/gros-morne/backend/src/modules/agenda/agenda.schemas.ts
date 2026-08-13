import { z } from 'zod';

const CATEGORIES = [
  'FESTIVAL', 'CARNAVAL', 'REUNION', 'MATCH', 'FORMATION', 'CONFERENCE', 'CULTUREL', 'SPORT', 'ECONOMIE', 'FETE', 'AUTRE',
] as const;

const STATUTS = ['BROUILLON', 'PUBLIE', 'ARCHIVE'] as const;

const traductionSchema = z.object({
  locale: z.enum(['FR', 'HT']),
  description: z.string().min(1, 'Description requise'),
});

export const listEvenementsPubliqueSchema = z.object({
  body: z.object({}).optional(),
  query: z.object({
    categorie: z.enum(CATEGORIES).optional(),
    q: z.string().min(1).max(100).optional(),
  }),
  params: z.object({}).optional(),
});

export const listEvenementsAdminSchema = z.object({
  body: z.object({}).optional(),
  query: z.object({}).optional(),
  params: z.object({}).optional(),
});

export const createEvenementSchema = z.object({
  body: z.object({
    nom: z.string().min(1).max(200),
    categorie: z.enum(CATEGORIES),
    date: z.coerce.date(),
    heureAffichage: z.string().max(100).optional(),
    lieu: z.string().min(1).max(200),
    organisateur: z.string().max(150).optional(),
    latitude: z.coerce.number().min(-90).max(90).optional(),
    longitude: z.coerce.number().min(-180).max(180).optional(),
    statutPublication: z.enum(STATUTS).default('BROUILLON'),
    imagePrincipaleId: z.string().min(1).optional(),
    ordre: z.coerce.number().int().default(0),
    traductions: z.array(traductionSchema).min(1, 'Au moins une traduction requise'),
  }),
  query: z.object({}).optional(),
  params: z.object({}).optional(),
});

export const updateEvenementSchema = z.object({
  body: z.object({
    nom: z.string().min(1).max(200).optional(),
    categorie: z.enum(CATEGORIES).optional(),
    date: z.coerce.date().optional(),
    heureAffichage: z.string().max(100).nullable().optional(),
    lieu: z.string().min(1).max(200).optional(),
    organisateur: z.string().max(150).nullable().optional(),
    latitude: z.coerce.number().min(-90).max(90).nullable().optional(),
    longitude: z.coerce.number().min(-180).max(180).nullable().optional(),
    statutPublication: z.enum(STATUTS).optional(),
    imagePrincipaleId: z.string().min(1).nullable().optional(),
    ordre: z.coerce.number().int().optional(),
    traductions: z.array(traductionSchema).min(1).optional(),
  }),
  query: z.object({}).optional(),
  params: z.object({
    id: z.string().min(1),
  }),
});

export const deleteEvenementSchema = z.object({
  body: z.object({}).optional(),
  query: z.object({}).optional(),
  params: z.object({
    id: z.string().min(1),
  }),
});
