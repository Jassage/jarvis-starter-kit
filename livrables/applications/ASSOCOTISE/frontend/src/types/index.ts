export type Role = 'secretaire' | 'responsable_finances';

export interface UtilisateurBureau {
  id: string;
  nom: string;
  email: string;
  role: Role;
  actif: boolean;
  creePar: string;
  creeLe: string;
}

export type StatutMembre = 'actif' | 'inactif';

export interface Membre {
  id: string;
  nom: string;
  telephone: string;
  email?: string;
  dateAdhesion: string;
  statut: StatutMembre;
  photoUrl?: string;
}

export type MoyenPaiement = 'cash' | 'moncash' | 'natcash' | 'virement';

export interface Cotisation {
  id: string;
  memberId: string;
  mois: string; // "2026-07"
  montant: number;
  date: string;
  moyenPaiement: MoyenPaiement;
  note?: string;
  saisiPar: string;
  saisiLe: string;
  corrige?: string; // id de la cotisation que ce document corrige, s'il y a lieu
}

export type CategorieDepense = 'materiel' | 'logistique' | 'administratif' | 'projet_business' | 'autre';

export interface Depense {
  id: string;
  description: string;
  categorie: CategorieDepense;
  montant: number;
  date: string;
  justificatifUrl?: string;
  saisiPar: string;
  saisiLe: string;
}

export type MethodeOrdreTontine = 'fixe' | 'aleatoire' | 'anciennete';
export type StatutCycleTontine = 'en_cours' | 'clos';

export interface CycleTontine {
  id: string;
  nom: string;
  dateDebut: string;
  montantCotisation: number;
  methodeOrdre: MethodeOrdreTontine;
  statut: StatutCycleTontine;
  creePar: string;
  creeLe: string;
}

export interface ParticipantTontine {
  id: string;
  cycleId: string;
  memberId: string;
  position: number;
  dateReceptionPrevue: string;
  aRecuSonTour: boolean;
  dateReception?: string;
}

export type StatutPaiementTontine = 'paye' | 'retard';

export interface PaiementTontine {
  id: string;
  cycleId: string;
  periode: number; // index du tour (1-based)
  memberId: string;
  montant: number;
  date: string;
  statut: StatutPaiementTontine;
  saisiPar: string;
}
