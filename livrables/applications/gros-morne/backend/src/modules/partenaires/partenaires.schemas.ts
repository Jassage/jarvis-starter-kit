import { z } from 'zod';

const CATEGORIES = ['INSTITUTIONNEL', 'ENTREPRISE', 'SPONSOR', 'ONG', 'MECENE', 'MEDIA'] as const;
const NIVEAUX = ['PLATINE', 'OR', 'ARGENT', 'BRONZE'] as const;
const EMPLACEMENTS = ['ACCUEIL', 'A_PROPOS'] as const;
const STATUTS = ['BROUILLON', 'PUBLIE', 'ARCHIVE'] as const;

export const listPartenairesPubliqueSchema = z.object({
  body: z.object({}).optional(),
  query: z.object({
    emplacement: z.enum(EMPLACEMENTS).optional(),
  }),
  params: z.object({}).optional(),
});

export const listPartenairesAdminSchema = z.object({
  body: z.object({}).optional(),
  query: z.object({}).optional(),
  params: z.object({}).optional(),
});

export const createPartenaireSchema = z.object({
  body: z.object({
    nom: z.string().min(1).max(150),
    categorie: z.enum(CATEGORIES),
    niveau: z.enum(NIVEAUX).optional(),
    lienSiteWeb: z.string().max(300).optional(),
    logoId: z.string().min(1).optional(),
    emplacements: z.array(z.enum(EMPLACEMENTS)).default([]),
    statutPublication: z.enum(STATUTS).default('BROUILLON'),
    ordre: z.coerce.number().int().default(0),
  }),
  query: z.object({}).optional(),
  params: z.object({}).optional(),
});

export const updatePartenaireSchema = z.object({
  body: z.object({
    nom: z.string().min(1).max(150).optional(),
    categorie: z.enum(CATEGORIES).optional(),
    niveau: z.enum(NIVEAUX).nullable().optional(),
    lienSiteWeb: z.string().max(300).nullable().optional(),
    logoId: z.string().min(1).nullable().optional(),
    emplacements: z.array(z.enum(EMPLACEMENTS)).optional(),
    statutPublication: z.enum(STATUTS).optional(),
    ordre: z.coerce.number().int().optional(),
  }),
  query: z.object({}).optional(),
  params: z.object({
    id: z.string().min(1),
  }),
});

export const deletePartenaireSchema = z.object({
  body: z.object({}).optional(),
  query: z.object({}).optional(),
  params: z.object({
    id: z.string().min(1),
  }),
});
