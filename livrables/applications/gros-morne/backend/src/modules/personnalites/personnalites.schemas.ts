import { z } from 'zod';

const CATEGORIES = ['POLITIQUE', 'CULTURE', 'EDUCATION', 'SPORT', 'ENTREPRENEURIAT', 'AUTRE'] as const;

const traductionSchema = z.object({
  locale: z.enum(['FR', 'HT']),
  domaine: z.string().min(1).max(150),
  biographie: z.string().min(1, 'Biographie requise'),
  realisations: z.array(z.string().min(1)).default([]),
  citation: z.string().max(500).optional(),
});

export const listPersonnalitesSchema = z.object({
  body: z.object({}).optional(),
  query: z.object({
    categorie: z.enum(CATEGORIES).optional(),
  }),
  params: z.object({}).optional(),
});

export const getPersonnaliteSchema = z.object({
  body: z.object({}).optional(),
  query: z.object({}).optional(),
  params: z.object({
    id: z.string().min(1),
  }),
});

export const createPersonnaliteSchema = z.object({
  body: z.object({
    nom: z.string().min(1).max(150),
    periode: z.string().max(100).optional(),
    photoUrl: z.string().max(500).optional(),
    categorie: z.enum(CATEGORIES).default('AUTRE'),
    dateNaissance: z.coerce.date().optional(),
    lieuNaissance: z.string().max(150).optional(),
    nationalite: z.string().max(100).optional(),
    profession: z.string().max(150).optional(),
    periodeActivite: z.string().max(100).optional(),
    ordre: z.coerce.number().int().default(0),
    traductions: z.array(traductionSchema).min(1, 'Au moins une traduction requise'),
  }),
  query: z.object({}).optional(),
  params: z.object({}).optional(),
});

export const updatePersonnaliteSchema = z.object({
  body: z.object({
    nom: z.string().min(1).max(150).optional(),
    periode: z.string().max(100).nullable().optional(),
    photoUrl: z.string().max(500).nullable().optional(),
    categorie: z.enum(CATEGORIES).optional(),
    dateNaissance: z.coerce.date().nullable().optional(),
    lieuNaissance: z.string().max(150).nullable().optional(),
    nationalite: z.string().max(100).nullable().optional(),
    profession: z.string().max(150).nullable().optional(),
    periodeActivite: z.string().max(100).nullable().optional(),
    ordre: z.coerce.number().int().optional(),
    traductions: z.array(traductionSchema).min(1).optional(),
  }),
  query: z.object({}).optional(),
  params: z.object({
    id: z.string().min(1),
  }),
});

export const deletePersonnaliteSchema = z.object({
  body: z.object({}).optional(),
  query: z.object({}).optional(),
  params: z.object({
    id: z.string().min(1),
  }),
});

const etapeTraductionSchema = z.object({
  locale: z.enum(['FR', 'HT']),
  titre: z.string().min(1).max(150),
  description: z.string().min(1),
});

export const creerEtapeSchema = z.object({
  body: z.object({
    annee: z.string().min(1).max(50),
    ordre: z.coerce.number().int().default(0),
    traductions: z.array(etapeTraductionSchema).min(1),
  }),
  query: z.object({}).optional(),
  params: z.object({ id: z.string().min(1) }),
});

export const modifierEtapeSchema = z.object({
  body: z.object({
    annee: z.string().min(1).max(50).optional(),
    ordre: z.coerce.number().int().optional(),
    traductions: z.array(etapeTraductionSchema).min(1).optional(),
  }),
  query: z.object({}).optional(),
  params: z.object({ etapeId: z.string().min(1) }),
});

export const supprimerEtapeSchema = z.object({
  body: z.object({}).optional(),
  query: z.object({}).optional(),
  params: z.object({ etapeId: z.string().min(1) }),
});

export const ajouterPhotoSchema = z.object({
  body: z.object({
    mediaId: z.string().min(1),
    ordre: z.coerce.number().int().default(0),
  }),
  query: z.object({}).optional(),
  params: z.object({ id: z.string().min(1) }),
});

export const supprimerPhotoSchema = z.object({
  body: z.object({}).optional(),
  query: z.object({}).optional(),
  params: z.object({ photoId: z.string().min(1) }),
});
