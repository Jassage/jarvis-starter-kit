import type { ReactNode } from 'react';

export function EmptyState({ icon, title, hint }: { icon?: ReactNode; title: string; hint?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-[var(--radius-card)] border border-dashed border-[var(--color-border)] py-16 text-center">
      {icon && <div className="text-[var(--color-muted)]">{icon}</div>}
      <p className="font-medium text-[var(--color-ink)]">{title}</p>
      {hint && <p className="max-w-sm text-sm text-[var(--color-muted)]">{hint}</p>}
    </div>
  );
}
