import { z } from 'zod';

const CATEGORIES = [
  'COMMUNIQUE', 'INTERVIEW', 'REPORTAGE', 'CULTURE', 'SPORT', 'SANTE',
  'AGRICULTURE', 'EDUCATION', 'POLITIQUE', 'DEVELOPPEMENT', 'INFRASTRUCTURE', 'AUTRE',
] as const;

const STATUTS = ['BROUILLON', 'PUBLIE', 'ARCHIVE'] as const;

const traductionSchema = z.object({
  locale: z.enum(['FR', 'HT']),
  resume: z.string().min(1, 'Résumé requis'),
  contenu: z.string().optional(),
});

export const listArticlesPubliqueSchema = z.object({
  body: z.object({}).optional(),
  query: z.object({
    categorie: z.enum(CATEGORIES).optional(),
    q: z.string().min(1).max(100).optional(),
  }),
  params: z.object({}).optional(),
});

export const listArticlesAdminSchema = z.object({
  body: z.object({}).optional(),
  query: z.object({}).optional(),
  params: z.object({}).optional(),
});

export const getArticlePubliqueSchema = z.object({
  body: z.object({}).optional(),
  query: z.object({}).optional(),
  params: z.object({
    id: z.string().min(1),
  }),
});

export const createArticleSchema = z.object({
  body: z.object({
    titre: z.string().min(1).max(200),
    auteur: z.string().max(150).optional(),
    categorie: z.enum(CATEGORIES),
    tags: z.array(z.string().min(1)).default([]),
    datePublication: z.coerce.date(),
    statutPublication: z.enum(STATUTS).default('BROUILLON'),
    imagePrincipaleId: z.string().min(1).optional(),
    ordre: z.coerce.number().int().default(0),
    traductions: z.array(traductionSchema).min(1, 'Au moins une traduction requise'),
  }),
  query: z.object({}).optional(),
  params: z.object({}).optional(),
});

export const updateArticleSchema = z.object({
  body: z.object({
    titre: z.string().min(1).max(200).optional(),
    auteur: z.string().max(150).nullable().optional(),
    categorie: z.enum(CATEGORIES).optional(),
    tags: z.array(z.string().min(1)).optional(),
    datePublication: z.coerce.date().optional(),
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

export const deleteArticleSchema = z.object({
  body: z.object({}).optional(),
  query: z.object({}).optional(),
  params: z.object({
    id: z.string().min(1),
  }),
});
