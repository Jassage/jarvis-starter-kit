import { Search, Plus } from 'lucide-react';
import type { ReactNode } from 'react';

export function PageToolbar({
  search,
  onSearch,
  searchPlaceholder = 'Rechercher…',
  actionLabel,
  onAction,
  extra,
}: {
  search?: string;
  onSearch?: (value: string) => void;
  searchPlaceholder?: string;
  actionLabel?: string;
  onAction?: () => void;
  extra?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
        {onSearch && (
          <div className="relative max-w-sm flex-1">
            <Search
              size={16}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-muted)]"
            />
            <input
              value={search}
              onChange={(e) => onSearch(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] py-2 pl-9 pr-3 text-sm outline-none focus:border-[var(--color-brand)]"
            />
          </div>
        )}
        {extra}
      </div>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--color-brand)] px-4 py-2 text-sm font-medium text-white transition hover:bg-[var(--color-brand-dark)]"
        >
          <Plus size={16} />
          {actionLabel}
        </button>
      )}
    </div>
  );
}
