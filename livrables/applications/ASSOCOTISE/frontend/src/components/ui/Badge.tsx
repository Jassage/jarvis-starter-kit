import type { ReactNode } from 'react';

type Tone = 'success' | 'danger' | 'warning' | 'info' | 'violet' | 'brand' | 'neutral';

const toneClasses: Record<Tone, string> = {
  success: 'bg-[var(--color-success-bg)] text-[var(--color-success)]',
  danger: 'bg-[var(--color-danger-bg)] text-[var(--color-danger)]',
  warning: 'bg-[var(--color-warning-bg)] text-[var(--color-warning)]',
  info: 'bg-[var(--color-info-bg)] text-[var(--color-info)]',
  violet: 'bg-[var(--color-violet-bg)] text-[var(--color-violet)]',
  brand: 'bg-[var(--color-brand-light)] text-[var(--color-brand-dark)]',
  neutral: 'bg-[var(--color-border)] text-[var(--color-muted)]',
};

export function Badge({ tone = 'neutral', children }: { tone?: Tone; children: ReactNode }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${toneClasses[tone]}`}
    >
      {children}
    </span>
  );
}
