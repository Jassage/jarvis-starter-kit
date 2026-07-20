import type { ReactNode } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

type Theme = 'brand' | 'gold' | 'blue' | 'violet' | 'rose';

const themeClasses: Record<Theme, string> = {
  brand: 'from-[var(--color-brand)] to-[var(--color-brand-dark)]',
  gold: 'from-[var(--color-gold)] to-[var(--color-gold-dark)]',
  blue: 'from-[var(--color-info)] to-[#1d4e82]',
  violet: 'from-[var(--color-violet)] to-[#4f3878]',
  rose: 'from-[var(--color-danger)] to-[#8a231b]',
};

export function StatCard({
  icon,
  theme = 'brand',
  label,
  value,
  sub,
  trend,
  compact = false,
}: {
  icon: ReactNode;
  theme?: Theme;
  label: string;
  value: string;
  sub?: string;
  trend?: number;
  compact?: boolean;
}) {
  return (
    <div
      className="rounded-[var(--radius-card)] p-[1px] shadow-[var(--shadow-card)] transition-shadow duration-200 hover:shadow-[var(--shadow-card-hover)]"
      style={{ background: 'var(--color-border)' }}
    >
      <div className={`rounded-[calc(var(--radius-card)-1px)] bg-[var(--color-surface)] ${compact ? 'p-4' : 'p-5'}`}>
        <div className="flex items-start justify-between">
          <div
            className={`flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-sm ${themeClasses[theme]}`}
          >
            {icon}
          </div>
          {trend !== undefined && (
            <span
              className={`flex items-center gap-0.5 text-xs font-medium ${
                trend >= 0 ? 'text-[var(--color-success)]' : 'text-[var(--color-danger)]'
              }`}
            >
              {trend >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
              {Math.abs(trend)}%
            </span>
          )}
        </div>
        <p className="mt-3 text-sm text-[var(--color-muted)]">{label}</p>
        <p className="mt-1 text-2xl font-semibold text-[var(--color-ink)]">{value}</p>
        {sub && <p className="mt-1 text-xs text-[var(--color-muted)]">{sub}</p>}
      </div>
    </div>
  );
}
