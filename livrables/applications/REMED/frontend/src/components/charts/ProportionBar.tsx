interface Segment {
  label: string;
  value: number;
}

// Encodage catégoriel (plusieurs catégories = identité) : ordre de teintes fixe (jamais généré),
// légende toujours présente dès 2 segments, gap de 2px entre segments (même règle que des barres
// empilées adjacentes).
const TEINTES = [
  'var(--color-primary-2)',
  'var(--color-accent)',
  'var(--color-violet)',
  'var(--color-rose)',
  'var(--color-warning)',
  'var(--color-success)',
  'var(--color-danger)',
  'var(--color-ink-3)',
];

export default function ProportionBar({ segments, formatValue }: { segments: Segment[]; formatValue: (v: number) => string }) {
  const total = segments.reduce((s, seg) => s + seg.value, 0);

  if (total === 0) {
    return (
      <div className="flex items-center justify-center text-sm py-6" style={{ color: 'var(--color-ink-3)' }}>
        Aucune dépense sur cette période
      </div>
    );
  }

  const tries = [...segments].sort((a, b) => b.value - a.value);

  return (
    <div className="space-y-4">
      <div className="flex h-3 rounded-full overflow-hidden gap-[2px]" style={{ background: 'var(--color-line-2)' }}>
        {tries.map((seg, i) => (
          <div
            key={seg.label}
            className="h-full first:rounded-l-full last:rounded-r-full"
            style={{ width: `${(seg.value / total) * 100}%`, background: TEINTES[i % TEINTES.length] }}
            title={`${seg.label} : ${formatValue(seg.value)}`}
          />
        ))}
      </div>
      <div className="grid grid-cols-2 gap-2">
        {tries.map((seg, i) => (
          <div key={seg.label} className="flex items-center gap-2 text-xs">
            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: TEINTES[i % TEINTES.length] }} />
            <span className="truncate" style={{ color: 'var(--color-ink-2)' }}>{seg.label}</span>
            <span className="ml-auto font-semibold shrink-0" style={{ color: 'var(--color-ink)' }}>{formatValue(seg.value)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
