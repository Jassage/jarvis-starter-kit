'use client';
import { useState } from 'react';
import DashboardTab from '@/components/compta/DashboardTab';
import JournalTab from '@/components/compta/JournalTab';
import GrandLivreTab from '@/components/compta/GrandLivreTab';
import BilanTab from '@/components/compta/BilanTab';
import ResultatTab from '@/components/compta/ResultatTab';
import ReconciliationTab from '@/components/compta/ReconciliationTab';

const TABS = [
  { id: 'dashboard', label: 'Tableau de bord' },
  { id: 'journal', label: 'Journal' },
  { id: 'grand-livre', label: 'Grand livre' },
  { id: 'bilan', label: 'Bilan' },
  { id: 'resultat', label: 'Résultat' },
  { id: 'reconciliation', label: 'Réconciliation' },
] as const;

type TabId = (typeof TABS)[number]['id'];

export default function ComptaPage() {
  const [tab, setTab] = useState<TabId>('dashboard');

  return (
    <div className="space-y-6">
      <div className="card flex gap-1 p-1.5 overflow-x-auto">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className="px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition-colors"
            style={{
              background: tab === t.id ? 'var(--color-primary-soft)' : 'transparent',
              color: tab === t.id ? 'var(--color-primary-2)' : 'var(--color-ink-3)',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'dashboard' && <DashboardTab />}
      {tab === 'journal' && <JournalTab />}
      {tab === 'grand-livre' && <GrandLivreTab />}
      {tab === 'bilan' && <BilanTab />}
      {tab === 'resultat' && <ResultatTab />}
      {tab === 'reconciliation' && <ReconciliationTab />}
    </div>
  );
}
