'use client';
import { useState } from 'react';
import VentesTab from '@/components/rapports/VentesTab';
import StockTab from '@/components/rapports/StockTab';
import AchatsTab from '@/components/rapports/AchatsTab';
import ClientsTab from '@/components/rapports/ClientsTab';

const TABS = [
  { id: 'ventes', label: 'Ventes' },
  { id: 'stock', label: 'Stock' },
  { id: 'achats', label: 'Achats' },
  { id: 'clients', label: 'Clients' },
] as const;

type TabId = (typeof TABS)[number]['id'];

export default function RapportsPage() {
  const [tab, setTab] = useState<TabId>('ventes');

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

      {tab === 'ventes' && <VentesTab />}
      {tab === 'stock' && <StockTab />}
      {tab === 'achats' && <AchatsTab />}
      {tab === 'clients' && <ClientsTab />}
    </div>
  );
}
