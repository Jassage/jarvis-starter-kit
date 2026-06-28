import { z } from 'zod';

const telephoneHT = z
  .string()
  .min(8, 'Numéro de téléphone invalide')
  .max(20)
  .regex(/^[0-9+\s\-()]+$/, 'Format de téléphone invalide');

export const createClientSchema = z.object({
  type: z.enum(['INDIVIDUEL', 'ENTREPRISE']),
  telephone: telephoneHT,
  adresse: z.string().max(500).trim().optional().or(z.literal('')),
  email: z.string().email('Email invalide').max(254).optional().or(z.literal('')),
  profession: z.string().max(100).optional(),
  notes: z.string().max(1000).optional(),
  photo: z.string().max(2000).optional(),

  // Individuel
  nom: z.string().max(100).trim().optional(),
  prenom: z.string().max(100).trim().optional(),
  dateNaissance: z.string().datetime().optional().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional()),
  lieuNaissance: z.string().max(100).optional(),
  pieceIdentite: z.string().max(50).optional(),
  numeroPiece: z.string().max(50).optional(),

  // Entreprise
  raisonSociale: z.string().max(200).trim().optional(),
  nif: z.string().max(50).optional(),
}).superRefine((data, ctx) => {
  if (data.type === 'INDIVIDUEL') {
    if (!data.nom?.trim()) ctx.addIssue({ code: 'custom', path: ['nom'], message: 'Nom requis pour un client individuel' });
  }
  if (data.type === 'ENTREPRISE') {
    if (!data.raisonSociale?.trim()) ctx.addIssue({ code: 'custom', path: ['raisonSociale'], message: 'Raison sociale requise pour une entreprise' });
  }
});

export const createCompteSchema = z.object({
  clientId: z.string().cuid('Identifiant client invalide'),
  agenceId: z.string().cuid('Identifiant agence invalide'),
  type: z.enum(['EPARGNE', 'COURANT', 'TERME', 'JOINT', 'MICRO_EPARGNE', 'TONTINE', 'RETRAITE', 'JEUNESSE', 'CREDIT']),
  devise: z.enum(['HTG', 'USD']).default('HTG'),
  soldeInitial: z.number().min(0, 'Le solde initial ne peut pas être négatif').optional(),
  soldeMinimum: z.number().min(0, 'Le solde minimum ne peut pas être négatif').optional(),
  intitule: z.string().max(200).optional(),
  tauxInteret: z.number().min(0).max(100).optional(),
  dateEcheance: z.string().datetime().optional(),
}).superRefine((data, ctx) => {
  if (data.soldeMinimum !== undefined && data.soldeInitial !== undefined && data.soldeMinimum > data.soldeInitial) {
    ctx.addIssue({ code: 'custom', path: ['soldeMinimum'], message: 'Le solde minimum ne peut pas dépasser le solde initial' });
  }
  if (data.dateEcheance) {
    const echeance = new Date(data.dateEcheance);
    if (echeance <= new Date()) {
      ctx.addIssue({ code: 'custom', path: ['dateEcheance'], message: 'La date d\'échéance doit être dans le futur' });
    }
  }
});
