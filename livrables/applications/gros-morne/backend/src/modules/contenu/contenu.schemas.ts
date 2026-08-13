import { z } from 'zod';

const traductionSchema = z.object({
  locale: z.enum(['FR', 'HT']),
  titre: z.string().max(200).optional(),
  contenu: z.string().min(1, 'Contenu requis'),
});

export const listContenuSchema = z.object({
  body: z.object({}).optional(),
  query: z.object({
    page: z.string().min(1, 'Paramètre page requis'),
  }),
  params: z.object({}).optional(),
});

export const createContenuSchema = z.object({
  body: z.object({
    page: z.string().min(1).max(100),
    cle: z.string().min(1).max(100),
    ordre: z.coerce.number().int().default(0),
    traductions: z.array(traductionSchema).min(1, 'Au moins une traduction requise'),
  }),
  query: z.object({}).optional(),
  params: z.object({}).optional(),
});

export const updateContenuSchema = z.object({
  body: z.object({
    ordre: z.coerce.number().int().optional(),
    traductions: z.array(traductionSchema).min(1).optional(),
  }),
  query: z.object({}).optional(),
  params: z.object({
    id: z.string().min(1),
  }),
});

export const deleteContenuSchema = z.object({
  body: z.object({}).optional(),
  query: z.object({}).optional(),
  params: z.object({
    id: z.string().min(1),
  }),
});
