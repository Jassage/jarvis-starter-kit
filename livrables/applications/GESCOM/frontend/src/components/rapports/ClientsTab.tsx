'use client';
import { useEffect } from 'react';
import { Users, CreditCard } from 'lucide-react';
import { useRapportStore } from '@/stores/rapportStore';
import { formatMontant, formatMontantCompact } from '@/lib/utils';
import StatCard from '@/components/ui/StatCard';
import Badge from '@/components/ui/Badge';
import EmptyState from '@/components/ui/EmptyState';

export default function ClientsTab() {
  const { clients, fetchClients } = useRapportStore();

  useEffect(() => { fetchClients(); }, [fetchClients]);

  if (!clients) return null;

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
        <StatCard icon={Users} theme="brand" label="CLIENTS ACTIFS" value={String(clients.nombreClients)} />
        <StatCard icon={CreditCard} theme="rose" label="ENCOURS CRÉDIT TOTAL" value={`${formatMontant(clients.encoursCreditTotal)} HTG`} />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {clients.ventilationParType.map((v) => (
          <div key={v.type} className="card p-4">
            <div className="flex items-center justify-between">
              <Badge tone={v.type === 'GROSSISTE' ? 'violet' : 'info'}>{v.type}</Badge>
              <span className="text-xs" style={{ color: 'var(--color-ink-3)' }}>{v.count} client(s)</span>
            </div>
            <p className="text-lg font-extrabold mt-2" style={{ color: 'var(--color-ink)' }}>{formatMontantCompact(v.soldeDu)}</p>
            <p className="text-xs" style={{ color: 'var(--color-ink-3)' }}>solde dû</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
        <div className="card overflow-hidden">
          <div className="px-4 py-3 font-bold text-sm" style={{ background: 'var(--color-danger-soft)', color: 'var(--color-danger)' }}>TOP CLIENTS PAR SOLDE DÛ</div>
          <table className="w-full table-shell">
            <tbody>
              {clients.topClientsSoldeDu.map((c) => (
                <tr key={c.id}>
                  <td>
                    <p className="font-semibold" style={{ color: 'var(--color-ink)' }}>{c.nom}</p>
                    <Badge tone={c.type === 'GROSSISTE' ? 'violet' : 'info'}>{c.type}</Badge>
                  </td>
                  <td className="text-right font-semibold whitespace-nowrap" style={{ color: 'var(--color-danger)' }}>{formatMontantCompact(c.soldeDu)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {clients.topClientsSoldeDu.length === 0 && <EmptyState title="Aucun client endetté" />}
        </div>

        <div className="card overflow-hidden">
          <div className="px-4 py-3 font-bold text-sm" style={{ background: 'var(--color-success-soft)', color: 'var(--color-success)' }}>TOP CLIENTS ACHETEURS</div>
          <table className="w-full table-shell">
            <tbody>
              {clients.topClientsAcheteurs.map((c) => (
                <tr key={c.id}>
                  <td>
                    <p className="font-semibold" style={{ color: 'var(--color-ink)' }}>{c.nom}</p>
                    <Badge tone={c.type === 'GROSSISTE' ? 'violet' : 'info'}>{c.type}</Badge>
                  </td>
                  <td className="text-right font-semibold whitespace-nowrap" style={{ color: 'var(--color-ink)' }}>{formatMontantCompact(c.montantAchete)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {clients.topClientsAcheteurs.length === 0 && <EmptyState title="Aucun achat client enregistré" />}
        </div>
      </div>
    </div>
  );
}
