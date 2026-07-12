import { z } from 'zod';

export const creerServiceSpaSchema = z.object({
  body: z.object({
    nom: z.string().min(1).max(150),
    dureeMinutes: z.number().int().positive(),
    prix: z.number().positive(),
    devise: z.enum(['HTG', 'USD']),
  }),
});

export const updateServiceSpaSchema = z.object({
  body: z.object({
    nom: z.string().min(1).max(150).optional(),
    dureeMinutes: z.number().int().positive().optional(),
    prix: z.number().positive().optional(),
    actif: z.boolean().optional(),
  }),
});

export const creerPraticienSchema = z.object({
  body: z.object({
    nom: z.string().min(1).max(150),
    specialites: z.string().max(300).optional(),
  }),
});

export const updatePraticienSchema = z.object({
  body: z.object({
    nom: z.string().min(1).max(150).optional(),
    specialites: z.string().max(300).optional(),
    actif: z.boolean().optional(),
  }),
});

export const creerRendezVousSchema = z.object({
  body: z.object({
    serviceSpaId: z.string(),
    praticienId: z.string(),
    dateHeure: z.coerce.date(),
    client: z.object({
      nom: z.string().min(1),
      telephone: z.string().min(1),
      email: z.string().email(),
    }),
  }),
});

export const terminerRendezVousSchema = z.object({
  body: z.object({
    chambreNumero: z.string().min(1).optional(),
    methodePaiement: z.enum(['ESPECES', 'CARTE', 'MONCASH', 'AUTRE']).optional(),
  }).refine((d) => d.chambreNumero || d.methodePaiement, {
    message: 'chambreNumero ou methodePaiement requis',
  }),
});
