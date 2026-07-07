import { LucideIcon } from 'lucide-react';

export default function StatCard({
  label,
  value,
  icon: Icon,
  hint,
}: {
  label: string;
  value: string | number;
  icon?: LucideIcon;
  hint?: string;
}) {
  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-bold tracking-wide uppercase" style={{ color: 'var(--color-ink-3)' }}>{label}</p>
        {Icon && (
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'var(--color-primary-soft)', color: 'var(--color-primary-2)' }}>
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>
      <p className="text-2xl font-extrabold tracking-tight">{value}</p>
      {hint && <p className="text-xs mt-1" style={{ color: 'var(--color-ink-3)' }}>{hint}</p>}
    </div>
  );
}
