import { z } from 'zod';

const deviseEnum = z.enum(['HTG', 'USD']);

export const createTypeChambreSchema = z.object({
  body: z.object({
    nom: z.string().min(2).max(100),
    capaciteMax: z.number().int().min(1).max(50),
    description: z.string().max(1000).optional(),
  }),
});

export const updateTypeChambreSchema = z.object({
  body: z.object({
    nom: z.string().min(2).max(100).optional(),
    capaciteMax: z.number().int().min(1).max(50).optional(),
    description: z.string().max(1000).optional(),
  }),
});

export const createTarifSchema = z.object({
  body: z.object({
    devise: deviseEnum,
    typeSejour: z.enum(['NUITEE', 'JOUR']).default('NUITEE'),
    montant: z.number().positive(),
    dateDebutSaison: z.coerce.date(),
    dateFinSaison: z.coerce.date(),
  }).refine((d) => d.dateFinSaison > d.dateDebutSaison, {
    message: 'La date de fin de saison doit être après la date de début',
    path: ['dateFinSaison'],
  }),
});

export const updateTarifSchema = z.object({
  body: z.object({
    devise: deviseEnum.optional(),
    typeSejour: z.enum(['NUITEE', 'JOUR']).optional(),
    montant: z.number().positive().optional(),
    dateDebutSaison: z.coerce.date().optional(),
    dateFinSaison: z.coerce.date().optional(),
  }),
});

export const createChambreSchema = z.object({
  body: z.object({
    typeChambreId: z.string().min(1),
    numero: z.string().min(1).max(20),
  }),
});

export const updateChambreSchema = z.object({
  body: z.object({
    numero: z.string().min(1).max(20).optional(),
    statut: z.enum(['DISPONIBLE', 'OCCUPEE', 'MAINTENANCE', 'NETTOYAGE_EN_COURS']).optional(),
  }),
});
