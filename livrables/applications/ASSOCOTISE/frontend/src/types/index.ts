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
  preuveUrl?: string;
  annulee?: boolean;
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
  annulee?: boolean;
  saisiPar: string;
  saisiLe: string;
  modifieLe?: string;
}

