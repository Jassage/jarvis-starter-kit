import { z } from 'zod';

const CATEGORIES = ['TOURISME', 'SERVICES', 'INVESTISSEMENT', 'DEMARCHES', 'FONCTIONNEMENT_SITE'] as const;
const STATUTS = ['BROUILLON', 'PUBLIE', 'ARCHIVE'] as const;

const traductionSchema = z.object({
  locale: z.enum(['FR', 'HT']),
  question: z.string().min(1, 'Question requise').max(300),
  reponse: z.string().min(1, 'Réponse requise'),
});

export const listFaqsPubliqueSchema = z.object({
  body: z.object({}).optional(),
  query: z.object({
    categorie: z.enum(CATEGORIES).optional(),
  }),
  params: z.object({}).optional(),
});

export const listFaqsAdminSchema = z.object({
  body: z.object({}).optional(),
  query: z.object({}).optional(),
  params: z.object({}).optional(),
});

export const createFaqSchema = z.object({
  body: z.object({
    categorie: z.enum(CATEGORIES),
    statutPublication: z.enum(STATUTS).default('BROUILLON'),
    ordre: z.coerce.number().int().default(0),
    traductions: z.array(traductionSchema).min(1, 'Au moins une traduction requise'),
  }),
  query: z.object({}).optional(),
  params: z.object({}).optional(),
});

export const updateFaqSchema = z.object({
  body: z.object({
    categorie: z.enum(CATEGORIES).optional(),
    statutPublication: z.enum(STATUTS).optional(),
    ordre: z.coerce.number().int().optional(),
    traductions: z.array(traductionSchema).min(1).optional(),
  }),
  query: z.object({}).optional(),
  params: z.object({
    id: z.string().min(1),
  }),
});

export const deleteFaqSchema = z.object({
  body: z.object({}).optional(),
  query: z.object({}).optional(),
  params: z.object({
    id: z.string().min(1),
  }),
});
