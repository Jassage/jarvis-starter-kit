'use client';
import { CalendarRange } from 'lucide-react';

export default function PeriodeFilter({
  from, to, onChange,
}: {
  from: string;
  to: string;
  onChange: (from: string, to: string) => void;
}) {
  return (
    <div className="card flex flex-wrap items-center gap-3 p-4">
      <CalendarRange className="w-4 h-4 shrink-0" style={{ color: 'var(--color-ink-3)' }} />
      <div className="flex items-center gap-2">
        <label className="text-xs font-semibold" style={{ color: 'var(--color-ink-3)' }}>Du</label>
        <input type="date" className="input" value={from} max={to} onChange={(e) => onChange(e.target.value, to)} />
      </div>
      <div className="flex items-center gap-2">
        <label className="text-xs font-semibold" style={{ color: 'var(--color-ink-3)' }}>Au</label>
        <input type="date" className="input" value={to} min={from} onChange={(e) => onChange(from, e.target.value)} />
      </div>
    </div>
  );
}
