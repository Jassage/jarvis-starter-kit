'use client';
import { useEffect, useState } from 'react';
import { DollarSign, TrendingUp, Receipt, CheckCircle2, AlertCircle } from 'lucide-react';
import { useRapportsStore } from '@/stores/rapportsStore';
import StatCard from '@/components/ui/StatCard';
import EmptyState from '@/components/ui/EmptyState';
import { Building2 } from 'lucide-react';

function ilYa(jours: number) { return new Date(Date.now() - jours * 86400000).toISOString().slice(0, 10); }
const AUJOURDHUI = new Date().toISOString().slice(0, 10);

export default function ChainePage() {
  const { rapportChaine, isLoading, fetchRapportChaine } = useRapportsStore();
  const [periode, setPeriode] = useState(30);

  useEffect(() => {
    fetchRapportChaine(ilYa(periode), AUJOURDHUI);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [periode]);

  return (
    <div className="space-y-5">
      <div className="flex justify-end">
        <select className="input sm:max-w-[200px]" value={periode} onChange={(e) => setPeriode(Number(e.target.value))}>
          <option value={7}>7 derniers jours</option>
          <option value={30}>30 derniers jours</option>
          <option value={90}>90 derniers jours</option>
        </select>
      </div>

      {isLoading || !rapportChaine ? (
        <div className="card p-10 text-center text-sm" style={{ color: 'var(--color-ink-3)' }}>Chargement...</div>
      ) : (
        <>
          {/* Jamais additionner HTG et USD dans un même total — toujours séparés. */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <StatCard icon={DollarSign} theme="blue" label="REVENU TOTAL HTG" value={`${rapportChaine.totalParDevise.HTG.toLocaleString('fr-FR')} HTG`} sub="Tous établissements confondus" />
            <StatCard icon={TrendingUp} theme="violet" label="REVENU TOTAL USD" value={`${rapportChaine.totalParDevise.USD.toLocaleString('fr-FR')} USD`} sub="Tous établissements confondus" />
          </div>

          <div className="space-y-3">
            <h2 className="text-sm font-bold tracking-widest" style={{ color: 'var(--color-ink-3)' }}>FACTURATION CONSOLIDÉE</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {(['HTG', 'USD'] as const).map((devise) => (
                <div key={devise} className="contents">
                  <StatCard icon={Receipt} theme="brand" label={`FACTURÉ ${devise}`} value={`${rapportChaine.totalFacturationParDevise[devise].facture.toLocaleString('fr-FR')} ${devise}`} compact />
                  <StatCard icon={CheckCircle2} theme="blue" label={`PAYÉ ${devise}`} value={`${rapportChaine.totalFacturationParDevise[devise].paye.toLocaleString('fr-FR')} ${devise}`} compact />
                  <StatCard icon={AlertCircle} theme="rose" label={`IMPAYÉ ${devise}`} value={`${rapportChaine.totalFacturationParDevise[devise].impaye.toLocaleString('fr-FR')} ${devise}`} compact />
                </div>
              ))}
            </div>
          </div>

          <div className="card overflow-x-auto">
            {rapportChaine.parEtablissement.length === 0 ? (
              <EmptyState icon={Building2} title="Aucun établissement actif" />
            ) : (
              <table className="table-shell w-full">
                <thead>
                  <tr>
                    <th>Établissement</th>
                    <th>Chambres</th>
                    <th>Taux d'occupation</th>
                    <th>Revenu HTG</th>
                    <th>Revenu USD</th>
                  </tr>
                </thead>
                <tbody>
                  {rapportChaine.parEtablissement.map((e) => (
                    <tr key={e.etablissementId}>
                      <td className="font-semibold" style={{ color: 'var(--color-ink)' }}>{e.nom}</td>
                      <td>{e.nbChambres}</td>
                      <td>{Math.round(e.tauxOccupation * 100)}%</td>
                      <td>{e.revenuParDevise.HTG.toLocaleString('fr-FR')} HTG</td>
                      <td>{e.revenuParDevise.USD.toLocaleString('fr-FR')} USD</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}
    </div>
  );
}
