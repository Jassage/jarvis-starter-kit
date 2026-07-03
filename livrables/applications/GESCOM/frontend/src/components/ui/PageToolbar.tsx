import { Search, Plus } from 'lucide-react';

export default function PageToolbar({
  search, onSearch, searchPlaceholder = 'Rechercher...', actionLabel, onAction,
}: {
  search?: string;
  onSearch?: (v: string) => void;
  searchPlaceholder?: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      {onSearch ? (
        <div className="relative sm:max-w-xs w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--color-ink-3)' }} />
          <input
            className="input pl-10"
            placeholder={searchPlaceholder}
            value={search}
            onChange={(e) => onSearch(e.target.value)}
          />
        </div>
      ) : <div />}
      {actionLabel && (
        <button onClick={onAction} className="btn btn-primary shrink-0">
          <Plus className="w-4 h-4" />
          {actionLabel}
        </button>
      )}
    </div>
  );
}
