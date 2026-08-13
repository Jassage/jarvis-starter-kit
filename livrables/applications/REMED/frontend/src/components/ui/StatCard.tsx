const THEME = {
  brand: { grad: 'var(--gradient-brand)', accent: 'card-accent-green' },
  blue: { grad: 'var(--gradient-blue)', accent: 'card-accent-blue' },
  amber: { grad: 'var(--gradient-amber)', accent: 'card-accent-amber' },
  violet: { grad: 'var(--gradient-violet)', accent: 'card-accent-violet' },
  rose: { grad: 'var(--gradient-rose)', accent: 'card-accent-rose' },
} as const;

export type StatTheme = keyof typeof THEME;

export default function StatCard({
  icon: Icon,
  theme = 'brand',
  label,
  value,
  sub,
}: {
  icon: React.ComponentType<{ className?: string }>;
  theme?: StatTheme;
  label: string;
  value: string;
  sub?: string;
}) {
  const t = THEME[theme];

  return (
    <div className="card card-hover p-5 sm:p-6">
      <div className="flex items-center justify-between mb-4">
        <div
          className="w-11 h-11 rounded-2xl flex items-center justify-center text-white shadow-sm"
          style={{ background: t.grad }}
        >
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <p className="text-[11px] font-bold tracking-widest mb-1.5" style={{ color: 'var(--color-ink-3)' }}>
        {label}
      </p>
      <p className="text-2xl sm:text-3xl font-extrabold tracking-tight" style={{ color: 'var(--color-ink)' }}>
        {value}
      </p>
      {sub && (
        <p className="text-xs mt-1.5" style={{ color: 'var(--color-ink-3)' }}>
          {sub}
        </p>
      )}
    </div>
  );
}
