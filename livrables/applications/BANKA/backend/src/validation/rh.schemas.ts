import { z } from 'zod';

export const createPosteSchema = z.object({
  code: z.string().min(1, 'Code requis').max(20).trim(),
  intitule: z.string().min(1, 'Intitulé requis').max(150).trim(),
  departement: z.string().max(100).optional(),
  salaireMin: z.number().min(0).optional(),
  salaireMax: z.number().min(0).optional(),
});

export const updatePosteSchema = z.object({
  intitule: z.string().min(1).max(150).trim().optional(),
  departement: z.string().max(100).optional(),
  salaireMin: z.number().min(0).optional(),
  salaireMax: z.number().min(0).optional(),
  actif: z.boolean().optional(),
});

// Whitelist stricte : matricule (généré serveur), utilisateurId (transite par /compte-systeme) sont exclus
export const createEmployeSchema = z.object({
  nom: z.string().min(1, 'Nom requis').max(100).trim(),
  prenom: z.string().min(1, 'Prénom requis').max(100).trim(),
  posteId: z.string().cuid('Poste invalide'),
  dateEmbauche: z.string().min(1, "Date d'embauche requise"),
  salaireBrut: z.number().positive('Le salaire brut doit être positif'),
  departement: z.string().max(100).optional(),
  telephone: z.string().max(20).optional(),
  email: z.string().email().max(254).optional(),
  agenceId: z.string().cuid().optional(),
});

// Whitelist stricte : matricule, dateEmbauche, agenceId, utilisateurId sont volontairement exclus —
// l'agence transite par la route dédiée /employes/:id/agence, le compte système par /compte-systeme
export const updateEmployeSchema = z.object({
  statut: z.enum(['ACTIF', 'INACTIF', 'CONGE', 'SUSPENDU']).optional(),
  salaireBrut: z.number().positive('Le salaire brut doit être positif').optional(),
  posteId: z.string().cuid().optional(),
  departement: z.string().max(100).optional(),
  telephone: z.string().max(20).optional(),
  email: z.string().email().max(254).optional(),
  adresse: z.string().max(500).optional(),
  compteId: z.string().cuid().optional(),
  modeReglement: z.enum(['VIREMENT_BANKA', 'ESPECES']).optional(),
  biometricId: z.number().int().nullable().optional(),
});

// Whitelist stricte : reference (générée serveur) exclue
export const createContratSchema = z.object({
  employeId: z.string().cuid('Employé invalide'),
  type: z.enum(['CDI', 'CDD', 'STAGE', 'CONSULTANT']),
  dateDebut: z.string().min(1, 'Date de début requise'),
  dateFin: z.string().optional(),
  salaireBrut: z.number().positive('Le salaire brut doit être positif'),
  notes: z.string().max(1000).optional(),
});

// Whitelist stricte : statut est volontairement exclu — seule la route /conges/:id/statut
// dédiée peut approuver/refuser un congé, jamais la création directe
export const createCongeSchema = z.object({
  employeId: z.string().cuid('Employé invalide'),
  type: z.enum(['ANNUEL', 'MALADIE', 'MATERNITE', 'PATERNITE', 'SANS_SOLDE', 'AUTRE']),
  dateDebut: z.string().min(1, 'Date de début requise'),
  dateFin: z.string().min(1, 'Date de fin requise'),
  motif: z.string().max(500).optional(),
});
