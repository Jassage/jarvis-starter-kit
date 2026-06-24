import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatMontant(montant: number | string, devise: string = 'HTG'): string {
  const n = typeof montant === 'string' ? parseFloat(montant) : montant;
  return new Intl.NumberFormat('fr-HT', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n) + ' ' + devise;
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(date));
}

export function formatDatetime(date: string | Date): string {
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
}

export function nomClient(client: { type: string; nom?: string | null; prenom?: string | null; raisonSociale?: string | null }): string {
  if (client.type === 'ENTREPRISE') return client.raisonSociale || '—';
  return [client.prenom, client.nom].filter(Boolean).join(' ') || '—';
}

export const TYPE_TRANSACTION_LABELS: Record<string, string> = {
  DEPOT: 'Dépôt',
  RETRAIT: 'Retrait',
  VIREMENT_DEBIT: 'Virement (débit)',
  VIREMENT_CREDIT: 'Virement (crédit)',
  DECAISSEMENT_PRET: 'Décaissement prêt',
  REMBOURSEMENT_PRET: 'Remboursement prêt',
  FRAIS: 'Frais',
  INTERET: 'Intérêt',
  AJUSTEMENT: 'Ajustement',
};

export const STATUT_TX_LABELS: Record<string, string> = {
  EN_ATTENTE: 'En attente',
  VALIDEE: 'Validée',
  REJETEE: 'Rejetée',
  ANNULEE: 'Annulée',
};

export const STATUT_PRET_LABELS: Record<string, string> = {
  EN_ATTENTE: 'En attente',
  APPROUVE: 'Approuvé',
  DECAISSE: 'Décaissé',
  EN_COURS: 'En cours',
  SOLDE: 'Soldé',
  EN_RETARD: 'En retard',
  REJETE: 'Rejeté',
  ANNULE: 'Annulé',
};

export const TYPE_COMPTE_LABELS: Record<string, string> = {
  EPARGNE:      'Épargne',
  COURANT:      'Courant',
  TERME:        'Terme fixe',
  JOINT:        'Compte joint',
  MICRO_EPARGNE:'Micro-épargne',
  TONTINE:      'Tontine / Sol',
  RETRAITE:     'Épargne retraite',
  JEUNESSE:     'Compte jeunesse',
  CREDIT:       'Ligne de crédit',
};

export const STATUT_COMPTE_LABELS: Record<string, string> = {
  ACTIF: 'Actif',
  INACTIF: 'Inactif',
  SUSPENDU: 'Suspendu',
  CLOTURE: 'Clôturé',
};
