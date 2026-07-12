import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

const THEME = {
  brand: { grad: 'var(--gradient-brand)', accent: 'card-accent-blue' },
  gold: { grad: 'var(--gradient-gold)', accent: 'card-accent-gold' },
  blue: { grad: 'var(--gradient-blue)', accent: 'card-accent-blue' },
  amber: { grad: 'var(--gradient-amber)', accent: 'card-accent-amber' },
  violet: { grad: 'var(--gradient-violet)', accent: 'card-accent-violet' },
  rose: { grad: 'var(--gradient-rose)', accent: 'card-accent-rose' },
} as const;

export type StatTheme = keyof typeof THEME;

function TrendBadge({ pct }: { pct: number }) {
  const Icon = pct > 0 ? TrendingUp : pct < 0 ? TrendingDown : Minus;
  const color = pct > 0 ? 'var(--color-success)' : pct < 0 ? 'var(--color-danger)' : 'var(--color-ink-3)';
  const bg = pct > 0 ? 'var(--color-success-soft)' : pct < 0 ? 'var(--color-danger-soft)' : 'var(--color-neutral-soft)';
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold" style={{ background: bg, color }}>
      <Icon className="w-3 h-3" />
      {pct > 0 ? '+' : ''}{pct}%
    </span>
  );
}

export default function StatCard({
  icon: Icon, theme = 'brand', label, value, sub, trend, compact = false,
}: {
  icon: React.ComponentType<{ className?: string }>;
  theme?: StatTheme;
  label: string;
  value: string;
  sub?: string;
  trend?: number;
  compact?: boolean;
}) {
  const t = THEME[theme];

  if (compact) {
    return (
      <div className={`card card-hover ${t.accent} p-5`}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0" style={{ background: t.grad }}>
            <Icon className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-bold tracking-widest truncate" style={{ color: 'var(--color-ink-3)' }}>{label}</p>
            <p className="text-xl font-extrabold truncate" style={{ color: 'var(--color-ink)' }}>{value}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card card-hover p-5 sm:p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="w-11 h-11 rounded-2xl flex items-center justify-center text-white shadow-sm" style={{ background: t.grad }}>
          <Icon className="w-5 h-5" />
        </div>
        {trend !== undefined && <TrendBadge pct={trend} />}
      </div>
      <p className="text-[11px] font-bold tracking-widest mb-1.5" style={{ color: 'var(--color-ink-3)' }}>{label}</p>
      <p className="text-2xl sm:text-3xl font-extrabold tracking-tight" style={{ color: 'var(--color-ink)' }}>{value}</p>
      {sub && <p className="text-xs mt-1.5" style={{ color: 'var(--color-ink-3)' }}>{sub}</p>}
    </div>
  );
}
