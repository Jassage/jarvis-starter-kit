import { useState } from 'react';
import { VueMois } from './VueMois';
import { VueAnnuelle } from './VueAnnuelle';

const onglets = [
  { id: 'mois', label: 'Vue mensuelle' },
  { id: 'annuelle', label: 'Vue annuelle par membre' },
] as const;

export function Cotisations() {
  const [onglet, setOnglet] = useState<(typeof onglets)[number]['id']>('mois');

  return (
    <div className="space-y-4">
      <div className="flex gap-1 border-b border-[var(--color-border)]">
        {onglets.map((o) => (
          <button
            key={o.id}
            onClick={() => setOnglet(o.id)}
            className={`px-3 py-2 text-sm font-medium transition ${
              onglet === o.id
                ? 'border-b-2 border-[var(--color-brand)] text-[var(--color-brand-dark)]'
                : 'text-[var(--color-muted)] hover:text-[var(--color-ink)]'
            }`}
          >
            {o.label}
          </button>
        ))}
      </div>
      {onglet === 'mois' ? <VueMois /> : <VueAnnuelle />}
    </div>
  );
}
