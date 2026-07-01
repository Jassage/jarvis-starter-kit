import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(amount: number | string, currency: 'HTG' | 'USD' = 'HTG'): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (currency === 'USD') {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(num);
  }
  return `${new Intl.NumberFormat('fr-HT', { maximumFractionDigits: 0 }).format(num)} HTG`;
}

export function formatPriceCompact(amount: number | string, currency: 'HTG' | 'USD' = 'HTG'): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  let compact: string;
  if (num >= 1_000_000) compact = `${(num / 1_000_000).toFixed(1)}M`;
  else if (num >= 1_000) compact = `${(num / 1_000).toFixed(0)}K`;
  else compact = num.toFixed(0);
  return currency === 'USD' ? `$${compact}` : `${compact} HTG`;
}

export const PROPERTY_TYPE_LABELS: Record<string, string> = {
  ROOM: 'Chambre',
  STUDIO: 'Studio',
  APARTMENT: 'Appartement',
  HOUSE: 'Maison',
  VILLA: 'Villa',
  LAND: 'Terrain',
  COMMERCIAL: 'Local commercial',
  OFFICE: 'Bureau',
  WAREHOUSE: 'Entrepôt',
};

export const LISTING_TYPE_LABELS: Record<string, string> = {
  RENT: 'À louer',
  SALE: 'À vendre',
};

export const DEPARTMENT_LABELS: Record<string, string> = {
  OUEST: 'Ouest',
  NORD: 'Nord',
  NORD_EST: 'Nord-Est',
  NORD_OUEST: 'Nord-Ouest',
  ARTIBONITE: 'Artibonite',
  CENTRE: 'Centre',
  SUD: 'Sud',
  SUD_EST: 'Sud-Est',
  NIPPES: 'Nippes',
  GRANDE_ANSE: 'Grande-Anse',
};

export const HAITI_DEPARTMENTS = Object.entries(DEPARTMENT_LABELS).map(([value, label]) => ({ value, label }));

export function getPropertyTypeIcon(type: string): string {
  const icons: Record<string, string> = {
    ROOM: '🛏️', STUDIO: '🏠', APARTMENT: '🏢', HOUSE: '🏡', VILLA: '🏰',
    LAND: '📍', COMMERCIAL: '🏪', OFFICE: '🏬', WAREHOUSE: '🏭',
  };
  return icons[type] || '🏠';
}

export function timeAgo(date: string | Date): string {
  const now = new Date();
  const d = new Date(date);
  const diff = Math.floor((now.getTime() - d.getTime()) / 1000);

  if (diff < 60) return 'À l\'instant';
  if (diff < 3600) return `Il y a ${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `Il y a ${Math.floor(diff / 3600)}h`;
  if (diff < 604800) return `Il y a ${Math.floor(diff / 86400)} jours`;
  return d.toLocaleDateString('fr-HT');
}

export function getInitials(firstName: string, lastName: string): string {
  return `${firstName[0] || ''}${lastName[0] || ''}`.toUpperCase();
}
