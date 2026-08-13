interface BarItem {
  label: string;
  value: number;
}

// Barres horizontales, série unique (identité déjà portée par le libellé de ligne, donc une
// seule teinte suffit — pas de légende nécessaire). Extrémité arrondie, étiquette de valeur
// directe (jamais un axe gradué séparé pour un top 5).
export default function BarListChart({ data, color = 'var(--color-primary-2)', formatValue }: { data: BarItem[]; color?: string; formatValue?: (v: number) => string }) {
  const max = Math.max(1, ...data.map((d) => d.value));

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center text-sm py-6" style={{ color: 'var(--color-ink-3)' }}>
        Aucune donnée sur cette période
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {data.map((d, i) => (
        <div key={i} className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium truncate pr-2" style={{ color: 'var(--color-ink-2)' }}>{d.label}</span>
            <span className="font-semibold shrink-0" style={{ color: 'var(--color-ink)' }}>{formatValue ? formatValue(d.value) : d.value}</span>
          </div>
          <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--color-line-2)' }}>
            <div className="h-full rounded-full" style={{ width: `${Math.max(4, (d.value / max) * 100)}%`, background: color }} />
          </div>
        </div>
      ))}
    </div>
  );
}
