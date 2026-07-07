export type RoleUtilisateur = 'SUPER_ADMIN' | 'CLIENT_ADMIN';

export interface Utilisateur {
  id: string;
  email: string;
  nom: string;
  prenom: string;
  role: RoleUtilisateur;
}

export interface ClientUser {
  id: string;
  email: string;
  nom: string;
  prenom: string;
  role: RoleUtilisateur;
  actif: boolean;
  createdAt: string;
  _count: { domaines: number };
}

export type StatutDomaine = 'EN_ATTENTE' | 'VERIFIE' | 'ECHEC' | 'SUSPENDU';

export interface Domain {
  id: string;
  nomDomaine: string;
  ownerId: string;
  statut: StatutDomaine;
  dkimSelector: string;
  dkimPublicKey: string;
  dkimTxtValue: string;
  mxOk: boolean;
  spfOk: boolean;
  dkimOk: boolean;
  dmarcOk: boolean;
  lastCheckedAt: string | null;
  lastError: string | null;
  verifiedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Mailbox {
  id: string;
  domainId: string;
  localPart: string;
  email: string;
  quotaMb: number;
  actif: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuditLog {
  id: string;
  userId: string | null;
  user: { email: string; nom: string; prenom: string } | null;
  action: string;
  entite: string;
  entiteId: string | null;
  changes: Record<string, unknown> | null;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
}

export interface Alias {
  id: string;
  domainId: string;
  source: string;
  destination: string;
  actif: boolean;
  createdAt: string;
}

export type PlanType = 'FREE' | 'STARTER' | 'PRO' | 'BUSINESS';

export interface PlanLimits {
  label: string;
  maxDomaines: number;
  maxMailboxesTotal: number;
  quotaMbParBoite: number;
  prixHtg: number;
}

export interface SubscriptionOverview {
  plan: PlanType;
  expiresAt: string | null;
  limites: PlanLimits;
  usage: { domaines: number; mailboxes: number };
}

export type StatutPaiement = 'EN_ATTENTE' | 'VALIDE' | 'REJETE';
export type MethodePaiement = 'MONCASH' | 'STRIPE';

export interface Payment {
  id: string;
  subscriptionId: string;
  plan: PlanType;
  montantHtg: number;
  methode: MethodePaiement;
  statut: StatutPaiement;
  referenceTransaction: string | null;
  createdAt: string;
  subscription?: {
    user: { email: string; nom: string; prenom: string };
  };
}

export interface MoncashInitiateResult {
  payment: Payment;
  instructions: { numero: string; nom: string; montantHtg: number };
}
