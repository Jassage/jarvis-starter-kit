export default function EmptyState({ icon: Icon, title, hint }: { icon?: React.ComponentType<{ className?: string }>; title: string; hint?: string }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-14 px-4">
      {Icon && (
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-3" style={{ background: 'var(--color-surface-2)', color: 'var(--color-ink-3)' }}>
          <Icon className="w-5 h-5" />
        </div>
      )}
      <p className="text-sm font-semibold" style={{ color: 'var(--color-ink-2)' }}>{title}</p>
      {hint && <p className="text-xs mt-1" style={{ color: 'var(--color-ink-3)' }}>{hint}</p>}
    </div>
  );
}
