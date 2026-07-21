export type Role = 'secretaire' | 'responsable_finances';

/**
 * Paramètres de l'association, document unique `settings/association`.
 * Remplace les constantes qui étaient codées en dur dans les écrans (montant de
 * cotisation, devise), pour que l'application serve une association quelconque.
 */
export interface ParametresAssociation {
  nomAssociation: string;
  montantCotisation: number;
  devise: string;
  /** Indicatif pays sans le « + », appliqué aux numéros saisis au format local. */
  indicatifPays: string;
  /** Modèle du message de relance. Variables : {nom} {mois} {montant} {association}. */
  modeleRelance: string;
  majPar: string;
  majLe: string;
}

export const MODELE_RELANCE_PAR_DEFAUT =
  'Bonjour {nom}, ta cotisation de {mois} ({montant}) n\'a pas encore été enregistrée. ' +
  'Merci de régulariser dès que possible. {association}';

export const PARAMETRES_PAR_DEFAUT: ParametresAssociation = {
  nomAssociation: 'AssoCotise',
  montantCotisation: 500,
  devise: 'HTG',
  indicatifPays: '509',
  modeleRelance: MODELE_RELANCE_PAR_DEFAUT,
  majPar: '',
  majLe: '',
};

/**
 * Exercice comptable annuel. Une fois clôturé, plus aucune écriture ne peut être créée,
 * corrigée ou annulée sur cette année : le solde de fin est figé et reporté sur l'exercice
 * suivant. Document identifié par l'année (« 2026 »).
 */
export interface Exercice {
  annee: string;
  statut: 'ouvert' | 'cloture';
  /** Solde repris des exercices antérieurs. */
  soldeReporte: number;
  totalCotise?: number;
  totalDepense?: number;
  soldeFinal?: number;
  clotureLe?: string;
  cloturePar?: string;
  rouvertLe?: string;
  rouvertPar?: string;
}

export type CanalRelance = 'whatsapp' | 'email';

/**
 * Trace d'une relance. L'application n'envoie rien elle-même (aucun backend, aucun crédit
 * SMS) : elle ouvre WhatsApp ou le client mail avec un message prêt, et enregistre ici le
 * fait qu'un membre du bureau a bien déclenché la relance.
 */
export interface Relance {
  id: string;
  memberId: string;
  mois: string; // "2026-07"
  canal: CanalRelance;
  envoyeePar: string;
  envoyeeLe: string;
}

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
  annuleePar?: string;
  annuleeLe?: string;
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
  annuleePar?: string;
  annuleeLe?: string;
  saisiPar: string;
  saisiLe: string;
  modifieLe?: string;
}

