import { z } from 'zod';

const telephoneHT = z
  .string()
  .min(8, 'Numéro de téléphone invalide')
  .max(20)
  .regex(/^[0-9+\s\-()]+$/, 'Format de téléphone invalide');

// Schéma de base sans superRefine pour pouvoir appeler .partial() sur la mise à jour
const clientBaseSchema = z.object({
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
});

function refineClient(data: z.infer<typeof clientBaseSchema>, ctx: z.RefinementCtx) {
  if (data.type === 'INDIVIDUEL') {
    if (!data.nom?.trim()) {
      ctx.addIssue({ code: 'custom', path: ['nom'], message: 'Nom requis pour un client individuel' });
    }
    if (!data.pieceIdentite?.trim()) {
      ctx.addIssue({ code: 'custom', path: ['pieceIdentite'], message: 'Type de pièce d\'identité requis' });
    }
    if (!data.numeroPiece?.trim()) {
      ctx.addIssue({ code: 'custom', path: ['numeroPiece'], message: 'Numéro de pièce d\'identité requis' });
    }
    if (data.dateNaissance) {
      const ddn = new Date(data.dateNaissance);
      const aujourd = new Date();
      const age = aujourd.getFullYear() - ddn.getFullYear() - (
        aujourd.getMonth() < ddn.getMonth() ||
        (aujourd.getMonth() === ddn.getMonth() && aujourd.getDate() < ddn.getDate()) ? 1 : 0
      );
      if (age < 18) {
        ctx.addIssue({ code: 'custom', path: ['dateNaissance'], message: 'Le client doit être majeur (18 ans minimum)' });
      }
    }
  }
  if (data.type === 'ENTREPRISE') {
    if (!data.raisonSociale?.trim()) ctx.addIssue({ code: 'custom', path: ['raisonSociale'], message: 'Raison sociale requise pour une entreprise' });
  }
}

export const createClientSchema = clientBaseSchema.superRefine(refineClient);

// La mise à jour rend tous les champs optionnels — le superRefine ne s'applique que si type est fourni
export const updateClientSchema = clientBaseSchema.partial().superRefine((data, ctx) => {
  if (data.type) refineClient(data as z.infer<typeof clientBaseSchema>, ctx);
});

export const changeStatutClientSchema = z.object({
  statut: z.enum(['ACTIF', 'INACTIF', 'SUSPENDU', 'BLACKLISTE'], {
    errorMap: () => ({ message: 'Statut invalide. Valeurs acceptées : ACTIF, INACTIF, SUSPENDU, BLACKLISTE' }),
  }),
  motif: z.string().max(500).optional(),
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
