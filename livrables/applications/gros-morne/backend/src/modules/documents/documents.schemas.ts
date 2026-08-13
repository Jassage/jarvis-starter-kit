import { z } from 'zod';

const STATUTS = ['BROUILLON', 'PUBLIE', 'ARCHIVE'] as const;

export const listDocumentsPubliqueSchema = z.object({
  body: z.object({}).optional(),
  query: z.object({}).optional(),
  params: z.object({}).optional(),
});

export const listDocumentsAdminSchema = z.object({
  body: z.object({}).optional(),
  query: z.object({}).optional(),
  params: z.object({}).optional(),
});

export const createDocumentSchema = z.object({
  body: z.object({
    titre: z.string().min(1, 'Titre requis').max(200),
    description: z.string().max(500).optional(),
    mediaId: z.string().min(1, 'Fichier requis'),
    statutPublication: z.enum(STATUTS).default('BROUILLON'),
    ordre: z.coerce.number().int().default(0),
  }),
  query: z.object({}).optional(),
  params: z.object({}).optional(),
});

export const updateDocumentSchema = z.object({
  body: z.object({
    titre: z.string().min(1).max(200).optional(),
    description: z.string().max(500).nullable().optional(),
    mediaId: z.string().min(1).optional(),
    statutPublication: z.enum(STATUTS).optional(),
    ordre: z.coerce.number().int().optional(),
  }),
  query: z.object({}).optional(),
  params: z.object({
    id: z.string().min(1),
  }),
});

export const deleteDocumentSchema = z.object({
  body: z.object({}).optional(),
  query: z.object({}).optional(),
  params: z.object({
    id: z.string().min(1),
  }),
});
