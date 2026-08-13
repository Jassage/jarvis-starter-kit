import { z } from 'zod';

const itemSchema = z.object({
  produitId: z.string().optional(),
  medicamentNom: z.string().min(1, 'Nom du médicament requis'),
  dosage: z.string().optional(),
  posologie: z.string().optional(),
  dureeJours: z.coerce.number().int().positive().optional(),
  quantitePrescrite: z.coerce.number().int().positive('La quantité prescrite doit être positive'),
  instructions: z.string().optional(),
});

export const creerOrdonnanceSchema = z.object({
  body: z.object({
    medecinNom: z.string().min(1, 'Nom du médecin requis'),
    patientNom: z.string().min(1, 'Nom du patient requis'),
    patientTelephone: z.string().optional(),
    clientId: z.string().optional(),
    dateEmission: z.coerce.date(),
    items: z.array(itemSchema).min(1, 'Au moins un médicament prescrit est requis'),
  }),
});

export const idParamSchema = z.object({
  params: z.object({ id: z.string().min(1) }),
});

export const listOrdonnancesQuerySchema = z.object({
  query: z.object({
    limit: z.coerce.number().int().positive().max(200).default(50),
    statut: z.enum(['ENREGISTREE', 'PARTIELLEMENT_SERVIE', 'SERVIE', 'ANNULEE']).optional(),
  }),
});
