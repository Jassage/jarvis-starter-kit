import { z } from 'zod';

const montantPositif = z
  .number({ invalid_type_error: 'Le montant doit être un nombre' })
  .positive('Le montant doit être positif')
  .max(99_999_999, 'Montant trop élevé');

export const depotSchema = z.object({
  compteId: z.string().cuid('Identifiant de compte invalide'),
  montant: montantPositif,
  motif: z.string().max(500).optional(),
  sessionId: z.string().cuid().optional(),
});

export const retraitSchema = z.object({
  compteId: z.string().cuid('Identifiant de compte invalide'),
  montant: montantPositif,
  motif: z.string().max(500).optional(),
  sessionId: z.string().cuid().optional(),
});

export const virementSchema = z.object({
  compteSourceId: z.string().cuid('Compte source invalide'),
  compteDestinationId: z.string().cuid('Compte destination invalide'),
  montant: montantPositif,
  motif: z.string().max(500).optional(),
  sessionId: z.string().cuid().optional(),
}).refine((d) => d.compteSourceId !== d.compteDestinationId, {
  message: 'Le compte source et le compte destination doivent être différents',
});

export const validerTransactionSchema = z.object({
  // id vient des params, pas du body
});

export const rejeterTransactionSchema = z.object({
  motif: z.string().min(5, 'Un motif de rejet est requis (5 caractères minimum)').max(500),
});
