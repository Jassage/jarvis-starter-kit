const montantFormatter = new Intl.NumberFormat('fr-HT', { maximumFractionDigits: 2 });
const dateFormatter = new Intl.DateTimeFormat('fr-HT', { day: '2-digit', month: 'short', year: 'numeric' });
const moisFormatter = new Intl.DateTimeFormat('fr-HT', { month: 'long', year: 'numeric' });

export function formatMontant(value: number): string {
  return `${montantFormatter.format(value)} HTG`;
}

export function formatMontantCompact(value: number): string {
  const abs = Math.abs(value);
  if (abs >= 1_000_000_000) return `${montantFormatter.format(value / 1_000_000_000)} Md HTG`;
  if (abs >= 1_000_000) return `${montantFormatter.format(value / 1_000_000)} M HTG`;
  if (abs >= 1_000) return `${montantFormatter.format(value / 1_000)} K HTG`;
  return formatMontant(value);
}

export function formatDate(value: string | Date): string {
  const date = typeof value === 'string' ? new Date(value) : value;
  return dateFormatter.format(date);
}

export function formatMoisLabel(mois: string): string {
  const [annee, m] = mois.split('-').map(Number);
  const label = moisFormatter.format(new Date(annee, m - 1, 1));
  return label.charAt(0).toUpperCase() + label.slice(1);
}

export function moisCourant(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

export function ajouterMois(mois: string, delta: number): string {
  const [annee, m] = mois.split('-').map(Number);
  const date = new Date(annee, m - 1 + delta, 1);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

export function formatRelativeTime(dateStr: string): string {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "à l'instant";
  if (diffMin < 60) return `il y a ${diffMin} min`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `il y a ${diffH} h`;
  const diffJ = Math.floor(diffH / 24);
  return `il y a ${diffJ} j`;
}
