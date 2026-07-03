'use client';
import { useEffect, useState } from 'react';
import { Truck, PackageCheck, Percent, AlertTriangle } from 'lucide-react';
import { useRapportStore } from '@/stores/rapportStore';
import { formatMontant, formatMontantCompact } from '@/lib/utils';
import StatCard from '@/components/ui/StatCard';
import Badge from '@/components/ui/Badge';
import EmptyState from '@/components/ui/EmptyState';
import PeriodeFilter from './PeriodeFilter';

function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

const STATUT_LABEL: Record<string, string> = {
  BROUILLON: 'Brouillon', ENVOYEE: 'Envoyée', RECUE_PARTIELLE: 'Reçue partielle', RECUE: 'Reçue', ANNULEE: 'Annulée',
};

export default function AchatsTab() {
  const { achats, fetchAchats } = useRapportStore();
  const [from, setFrom] = useState(isoDate(new Date(Date.now() - 29 * 24 * 60 * 60 * 1000)));
  const [to, setTo] = useState(isoDate(new Date()));

  useEffect(() => { fetchAchats({ from, to }); }, [fetchAchats, from, to]);

  return (
    <div className="space-y-5">
      <PeriodeFilter from={from} to={to} onChange={(f, t) => { setFrom(f); setTo(t); }} />

      {!achats ? null : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-5">
            <StatCard icon={Truck} theme="brand" label="MONTANT COMMANDÉ" value={`${formatMontant(achats.montantCommande)} HTG`} />
            <StatCard icon={PackageCheck} theme="blue" label="MONTANT REÇU" value={`${formatMontant(achats.montantRecu)} HTG`} />
            <StatCard icon={Percent} theme="violet" label="TAUX DE RÉCEPTION" value={`${achats.tauxReception}%`} />
            <StatCard icon={AlertTriangle} theme="rose" label="COMMANDES EN RETARD" value={String(achats.commandesEnRetard.length)} />
          </div>

          <div className="card overflow-hidden">
            <div className="px-4 py-3 font-bold text-sm" style={{ background: 'var(--color-primary-soft)', color: 'var(--color-primary-2)' }}>TOP FOURNISSEURS</div>
            <table className="w-full table-shell">
              <tbody>
                {achats.topFournisseurs.map((f) => (
                  <tr key={f.fournisseurId}>
                    <td>
                      <p className="font-semibold" style={{ color: 'var(--color-ink)' }}>{f.nom}</p>
                      <p className="text-xs" style={{ color: 'var(--color-ink-3)' }}>{f.nombreCommandes} commande(s)</p>
                    </td>
                    <td className="text-right whitespace-nowrap">
                      <p className="font-semibold" style={{ color: 'var(--color-ink)' }}>{formatMontantCompact(f.montantCommande)}</p>
                      <p className="text-xs" style={{ color: 'var(--color-ink-3)' }}>reçu {formatMontantCompact(f.montantRecu)}</p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {achats.topFournisseurs.length === 0 && <EmptyState title="Aucune commande sur la période" />}
          </div>

          <div className="card overflow-hidden">
            <div className="px-4 py-3 font-bold text-sm" style={{ background: 'var(--color-danger-soft)', color: 'var(--color-danger)' }}>COMMANDES EN RETARD</div>
            <table className="w-full table-shell">
              <tbody>
                {achats.commandesEnRetard.map((c) => (
                  <tr key={c.id}>
                    <td>
                      <p className="font-semibold" style={{ color: 'var(--color-ink)' }}>{c.numero}</p>
                      <p className="text-xs" style={{ color: 'var(--color-ink-3)' }}>{c.fournisseur}</p>
                    </td>
                    <td className="text-right whitespace-nowrap">
                      <Badge tone="warning">{STATUT_LABEL[c.statut] ?? c.statut}</Badge>
                      <p className="text-xs mt-1" style={{ color: 'var(--color-ink-3)' }}>
                        prévue {new Date(c.dateLivraisonPrevue).toLocaleDateString('fr-FR')}
                      </p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {achats.commandesEnRetard.length === 0 && <EmptyState title="Aucune commande en retard" />}
          </div>
        </>
      )}
    </div>
  );
}
