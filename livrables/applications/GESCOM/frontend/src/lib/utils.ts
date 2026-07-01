export function formatMontant(value: number | string): string {
  return new Intl.NumberFormat('fr-HT', { maximumFractionDigits: 2 }).format(Number(value));
}

export function formatMontantCompact(value: number | string): string {
  const n = Number(value);
  const abs = Math.abs(n);
  if (abs >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1).replace('.0', '')} Md HTG`;
  if (abs >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace('.0', '')} M HTG`;
  if (abs >= 1_000) return `${(n / 1_000).toFixed(1).replace('.0', '')} K HTG`;
  return `${formatMontant(n)} HTG`;
}

export function formatRelativeTime(dateStr: string): string {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const diffMin = Math.round(diffMs / 60000);
  if (diffMin < 1) return "à l'instant";
  if (diffMin < 60) return `il y a ${diffMin} min`;
  const diffH = Math.round(diffMin / 60);
  if (diffH < 24) return `il y a ${diffH} h`;
  const diffJ = Math.round(diffH / 24);
  if (diffJ < 7) return `il y a ${diffJ} j`;
  return new Date(dateStr).toLocaleDateString('fr-FR');
}
