import { z } from 'zod';

const typePackageEnum = z.enum(['TITRE_MATCH', 'BANDEAU', 'HABILLAGE_PERMANENT']);

export const createSponsorSchema = z.object({
  body: z.object({
    nomSponsor: z.string().min(2, 'Nom du sponsor requis'),
    typePackage: typePackageEnum,
    contactNom: z.string().optional().nullable(),
    contactTelephone: z.string().optional().nullable(),
    dateDebutContrat: z.string().datetime(),
    dateFinContrat: z.string().datetime(),
  }).refine((d) => new Date(d.dateFinContrat) > new Date(d.dateDebutContrat), {
    message: 'La date de fin de contrat doit être postérieure à la date de début',
    path: ['dateFinContrat'],
  }),
});

export const updateSponsorSchema = z.object({
  params: z.object({ id: z.string() }),
  body: z.object({
    nomSponsor: z.string().min(2).optional(),
    typePackage: typePackageEnum.optional(),
    contactNom: z.string().optional().nullable(),
    contactTelephone: z.string().optional().nullable(),
    dateDebutContrat: z.string().datetime().optional(),
    dateFinContrat: z.string().datetime().optional(),
  }),
});

export const idParamSchema = z.object({
  params: z.object({ id: z.string() }),
});
