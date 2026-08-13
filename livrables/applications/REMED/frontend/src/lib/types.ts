export type Role = 'SUPER_ADMIN' | 'GERANT' | 'PHARMACIEN' | 'VENDEUR' | 'MAGASINIER';

export interface Utilisateur {
  id: string;
  email: string;
  nom: string;
  prenom: string;
  role: Role;
  telephone?: string | null;
  actif?: boolean;
  createdAt?: string;
}

export type FormePharmaceutique =
  | 'COMPRIME'
  | 'GELULE'
  | 'SIROP'
  | 'INJECTABLE'
  | 'POMMADE_CREME'
  | 'SUPPOSITOIRE'
  | 'SACHET'
  | 'GOUTTE'
  | 'SOLUTE'
  | 'AUTRE';

export interface Categorie {
  id: string;
  nom: string;
  description?: string | null;
}

export interface LotProduit {
  id: string;
  produitId: string;
  numeroLot: string;
  dateExpiration: string;
  quantiteInitiale: number;
  quantiteActuelle: number;
  prixAchatUnitaire: string;
  fournisseurId?: string | null;
}

export interface Produit {
  id: string;
  nom: string;
  dci?: string | null;
  dosage?: string | null;
  formePharmaceutique: FormePharmaceutique;
  codeBarres?: string | null;
  categorieId?: string | null;
  categorie?: Categorie | null;
  prixAchat: string;
  prixVente: string;
  seuilAlerte: number;
  necessiteOrdonnance: boolean;
  substanceControlee: boolean;
  actif: boolean;
  quantiteTotal: number;
  lots?: LotProduit[];
}

export interface Fournisseur {
  id: string;
  nom: string;
  contact?: string | null;
  telephone?: string | null;
  email?: string | null;
  adresse?: string | null;
  actif: boolean;
}

export interface MouvementStock {
  id: string;
  produitId: string;
  lotId?: string | null;
  type: string;
  quantite: number;
  quantiteAvant: number;
  quantiteApres: number;
  motif?: string | null;
  createdAt: string;
  produit: { nom: string };
  lot?: { numeroLot: string } | null;
  utilisateur: { nom: string; prenom: string };
}

export type PeriodePreset = 'jour' | 'semaine' | 'mois' | 'annee';

export interface StatsPeriode {
  periode: { debut: string; fin: string };
  ca: number;
  nombreVentes: number;
  beneficeEstime: number;
  depensesTotal: number;
  creditTotal: number;
  ruptures: number;
  serieCA: { date: string; valeur: number }[];
  topProduits: { nom: string; quantite: number }[];
  depensesParCategorie: { categorie: string; montant: number }[];
}

export interface DashboardStats {
  totalProduits: number;
  valeurStock: number;
  produitsEnAlerte: number;
  lotsPerimesBientot: number;
  totalFournisseurs: number;
  ventesAujourdhui: number | null;
}

export interface Client {
  id: string;
  nom: string;
  prenom?: string | null;
  telephone?: string | null;
  email?: string | null;
  adresse?: string | null;
  dateNaissance?: string | null;
  sexe?: string | null;
  notes?: string | null;
  ventes?: { id: string; numero: string; montantTotal: string; statut: string; createdAt: string }[];
}

export type ModePaiement = 'ESPECES' | 'CARTE' | 'VIREMENT' | 'CHEQUE' | 'MOBILE_MONEY' | 'CREDIT' | 'AUTRE';

export interface Paiement {
  id: string;
  mode: ModePaiement;
  montant: string;
}

export interface LigneVente {
  id: string;
  produitId: string;
  lotId: string;
  quantite: number;
  prixUnitaire: string;
  produit: { nom: string; dosage?: string | null };
  lot?: { numeroLot: string } | null;
}

export type StatutOrdonnance = 'ENREGISTREE' | 'PARTIELLEMENT_SERVIE' | 'SERVIE' | 'ANNULEE';

export interface PrescriptionItem {
  id: string;
  produitId?: string | null;
  medicamentNom: string;
  dosage?: string | null;
  posologie?: string | null;
  dureeJours?: number | null;
  quantitePrescrite: number;
  quantiteServie: number;
  instructions?: string | null;
  produit?: { nom: string; dosage?: string | null } | null;
}

export interface Ordonnance {
  id: string;
  numero: string;
  medecinNom: string;
  patientNom: string;
  patientTelephone?: string | null;
  dateEmission: string;
  statut: StatutOrdonnance;
  pieceJointeUrl?: string | null;
  createdAt?: string;
  client?: { nom: string; prenom?: string | null } | null;
  items: PrescriptionItem[];
}

export type StatutVente = 'COMPLETEE' | 'ANNULEE';

export interface Vente {
  id: string;
  numero: string;
  statut: StatutVente;
  sousTotal: string;
  remise: string;
  montantTotal: string;
  createdAt: string;
  caissier: { nom: string; prenom: string };
  client?: Client | null;
  lignes: LigneVente[];
  paiements: Paiement[];
  ordonnance?: Ordonnance | null;
  motifAnnulation?: string | null;
}

export type StatutCaisse = 'OUVERTE' | 'FERMEE';

export interface CaisseTransaction {
  id: string;
  type: 'VENTE' | 'ENTREE_MANUELLE' | 'SORTIE_MANUELLE';
  montant: string;
  motif?: string | null;
  createdAt: string;
}

export interface CaisseSession {
  id: string;
  statut: StatutCaisse;
  montantOuverture: string;
  montantFermeture?: string | null;
  soldeTheorique?: string | null;
  ecart?: string | null;
  ouverteLe: string;
  fermeeLe?: string | null;
  ouvertePar: { nom: string; prenom: string };
  fermeePar?: { nom: string; prenom: string } | null;
  transactions?: CaisseTransaction[];
}

// ─────────────────────────────────────────────────────────────
// Achats / Fournisseurs
// ─────────────────────────────────────────────────────────────

export type StatutCommandeAchat = 'BROUILLON' | 'ENVOYEE' | 'RECUE_PARTIELLE' | 'RECUE_COMPLETE' | 'ANNULEE';

export interface LigneCommandeAchat {
  id: string;
  produitId: string;
  quantiteCommandee: number;
  quantiteRecue: number;
  prixUnitaire: string;
  produit: { nom: string; dosage?: string | null };
}

export interface CommandeAchat {
  id: string;
  numero: string;
  statut: StatutCommandeAchat;
  createdAt: string;
  fournisseur: { nom: string };
  creePar: { nom: string; prenom: string };
  lignes: LigneCommandeAchat[];
}

// ─────────────────────────────────────────────────────────────
// Dépenses
// ─────────────────────────────────────────────────────────────

export type CategorieDepense = 'LOYER' | 'ELECTRICITE' | 'INTERNET' | 'TRANSPORT' | 'SALAIRES' | 'FOURNITURES' | 'MAINTENANCE' | 'AUTRES';

export interface Depense {
  id: string;
  categorie: CategorieDepense;
  montant: string;
  description?: string | null;
  modePaiement: ModePaiement;
  createdAt: string;
  utilisateur: { nom: string; prenom: string };
}

// ─────────────────────────────────────────────────────────────
// Retours
// ─────────────────────────────────────────────────────────────

export type TypeRetour = 'RETOUR_CLIENT' | 'RETOUR_FOURNISSEUR' | 'PRODUIT_ENDOMMAGE' | 'PRODUIT_EXPIRE' | 'ERREUR_VENTE';

export interface RetourItem {
  id: string;
  produitId: string;
  lotId: string;
  quantite: number;
  produit: { nom: string };
}

export interface Retour {
  id: string;
  numero: string;
  type: TypeRetour;
  motif?: string | null;
  createdAt: string;
  fournisseur?: { nom: string } | null;
  vente?: { numero: string } | null;
  utilisateur: { nom: string; prenom: string };
  lignes: RetourItem[];
}

// ─────────────────────────────────────────────────────────────
// Inventaire
// ─────────────────────────────────────────────────────────────

export type TypeInventaire = 'COMPLET' | 'PARTIEL';
export type StatutInventaire = 'EN_COURS' | 'VALIDE' | 'ANNULE';

export interface InventaireItem {
  id: string;
  lotId: string;
  quantiteTheorique: number;
  quantiteReelle?: number | null;
  motif?: string | null;
  lot: { numeroLot: string; produit: { id: string; nom: string; dosage?: string | null } };
}

export type TypeNotification = 'STOCK_BAS' | 'PEREMPTION_PROCHE' | 'COMMANDE_RECUE';

export interface Notification {
  id: string;
  type: TypeNotification;
  titre: string;
  message: string;
  lienEntite?: string | null;
  lue: boolean;
  createdAt: string;
}

// ─────────────────────────────────────────────────────────────
// Rapports
// ─────────────────────────────────────────────────────────────

export interface RapportVentes {
  periode: { debut: string; fin: string };
  totalCA: number;
  totalVentes: number;
  parJour: { date: string; valeur: number }[];
  parCaissier: { nom: string; ca: number; nombreVentes: number }[];
  parProduit: { nom: string; quantite: number; ca: number }[];
  parCategorie: { categorie: string; ca: number }[];
  ventes: { numero: string; date: string; caissier: string; montantTotal: number }[];
}

export interface RapportStock {
  valeurTotale: number;
  ruptures: number;
  stockBas: number;
  lignes: { nom: string; quantiteTotal: number; seuilAlerte: number; valeur: number; statut: string }[];
  lotsPeremption: { produit: string; numeroLot: string; dateExpiration: string; quantite: number }[];
  mouvementsRecents: { date: string; produit: string; lot: string; type: string; quantite: number; utilisateur: string }[];
}

export interface RapportAchats {
  periode: { debut: string; fin: string };
  montantTotalCommande: number;
  montantTotalRecu: number;
  nombreCommandes: number;
  parFournisseur: { nom: string; montantCommande: number; montantRecu: number; nombreCommandes: number }[];
  commandes: { numero: string; fournisseur: string; statut: string; date: string; montant: number }[];
}

export interface RapportFinance {
  periode: { debut: string; fin: string };
  ca: number;
  depensesTotal: number;
  beneficeEstime: number;
  caisseSessions: {
    ouverteLe: string;
    fermeeLe?: string | null;
    statut: string;
    montantOuverture: number;
    montantFermeture?: number | null;
    soldeTheorique?: number | null;
    ecart?: number | null;
    ouvertePar: string;
  }[];
}

export interface Inventaire {
  id: string;
  numero: string;
  type: TypeInventaire;
  statut: StatutInventaire;
  createdAt: string;
  valideLe?: string | null;
  creePar: { nom: string; prenom: string };
  validePar?: { nom: string; prenom: string } | null;
  lignes: InventaireItem[];
}
