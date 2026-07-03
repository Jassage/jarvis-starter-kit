'use client';
import { useEffect, useState } from 'react';
import { Wallet, ShoppingCart, Receipt, TrendingUp } from 'lucide-react';
import { useRapportStore } from '@/stores/rapportStore';
import { formatMontant, formatMontantCompact } from '@/lib/utils';
import StatCard from '@/components/ui/StatCard';
import EmptyState from '@/components/ui/EmptyState';
import PeriodeFilter from './PeriodeFilter';

function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

const MODE_LABEL: Record<string, string> = { ESPECES: 'Espèces', CHEQUE: 'Chèque', VIREMENT: 'Virement', CREDIT: 'Crédit' };

export default function VentesTab() {
  const { ventes, fetchVentes } = useRapportStore();
  const [from, setFrom] = useState(isoDate(new Date(Date.now() - 29 * 24 * 60 * 60 * 1000)));
  const [to, setTo] = useState(isoDate(new Date()));

  useEffect(() => { fetchVentes({ from, to }); }, [fetchVentes, from, to]);

  const venteMax = Math.max(1, ...(ventes?.evolution.map((v) => v.montant) ?? [1]));

  return (
    <div className="space-y-5">
      <PeriodeFilter from={from} to={to} onChange={(f, t) => { setFrom(f); setTo(t); }} />

      {!ventes ? null : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-5">
            <StatCard icon={Wallet} theme="brand" label="CHIFFRE D'AFFAIRES" value={`${formatMontant(ventes.caTotal)} HTG`} />
            <StatCard icon={ShoppingCart} theme="blue" label="VENTES VALIDÉES" value={String(ventes.nombreVentes)} />
            <StatCard icon={Receipt} theme="amber" label="PANIER MOYEN" value={`${formatMontant(ventes.panierMoyen)} HTG`} />
            <StatCard icon={TrendingUp} theme="violet" label="MARGE ESTIMÉE" value={`${formatMontant(ventes.margeTotaleEstimee)} HTG`} sub="Sur prix d'achat moyen courant" />
          </div>

          <div className="card p-5 sm:p-6">
            <h3 className="text-sm font-bold tracking-wide mb-5" style={{ color: 'var(--color-ink)' }}>ÉVOLUTION DES VENTES</h3>
            {ventes.evolution.length === 0 ? (
              <EmptyState title="Aucune vente sur la période" />
            ) : (
              <div className="flex items-end justify-between gap-1 h-40 overflow-x-auto">
                {ventes.evolution.map((v) => {
                  const hauteurPct = Math.max(4, (v.montant / venteMax) * 100);
                  const jour = new Date(v.date + 'T12:00:00').toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
                  return (
                    <div key={v.date} className="flex-1 min-w-[24px] flex flex-col items-center justify-end h-full gap-2">
                      <div
                        className="w-full rounded-t-lg transition-all"
                        title={`${formatMontant(v.montant)} HTG · ${v.count} vente(s)`}
                        style={{ height: `${hauteurPct}%`, background: 'var(--gradient-brand)', minHeight: 4 }}
                      />
                      <span className="text-[10px] font-bold whitespace-nowrap" style={{ color: 'var(--color-ink-3)' }}>{jour}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
            <div className="card overflow-hidden">
              <div className="px-4 py-3 font-bold text-sm" style={{ background: 'var(--color-primary-soft)', color: 'var(--color-primary-2)' }}>TOP PRODUITS</div>
              <table className="w-full table-shell">
                <tbody>
                  {ventes.topProduits.map((p) => (
                    <tr key={p.produitId}>
                      <td>
                        <p className="font-semibold" style={{ color: 'var(--color-ink)' }}>{p.nom}</p>
                        <p className="text-xs" style={{ color: 'var(--color-ink-3)' }}>{p.reference} · {p.quantiteVendue} {p.unite}</p>
                      </td>
                      <td className="text-right font-semibold whitespace-nowrap" style={{ color: 'var(--color-ink)' }}>{formatMontantCompact(p.montantVendu)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {ventes.topProduits.length === 0 && <EmptyState title="Aucun produit vendu sur la période" />}
            </div>

            <div className="card overflow-hidden">
              <div className="px-4 py-3 font-bold text-sm" style={{ background: 'var(--color-info-soft)', color: 'var(--color-info)' }}>TOP CLIENTS</div>
              <table className="w-full table-shell">
                <tbody>
                  {ventes.topClients.map((c) => (
                    <tr key={c.clientId}>
                      <td>
                        <p className="font-semibold" style={{ color: 'var(--color-ink)' }}>{c.nom}</p>
                        <p className="text-xs" style={{ color: 'var(--color-ink-3)' }}>{c.nombreAchats} achat(s)</p>
                      </td>
                      <td className="text-right font-semibold whitespace-nowrap" style={{ color: 'var(--color-ink)' }}>{formatMontantCompact(c.montantAchete)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {ventes.topClients.length === 0 && <EmptyState title="Aucun client identifié sur la période" />}
            </div>
          </div>

          <div className="card p-5 sm:p-6">
            <h3 className="text-sm font-bold tracking-wide mb-4" style={{ color: 'var(--color-ink)' }}>RÉPARTITION PAR MODE DE PAIEMENT</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {ventes.ventilationModePaiement.map((v) => (
                <div key={v.modePaiement} className="rounded-2xl p-4" style={{ background: 'var(--color-surface-2)' }}>
                  <p className="text-xs font-bold" style={{ color: 'var(--color-ink-3)' }}>{MODE_LABEL[v.modePaiement] ?? v.modePaiement}</p>
                  <p className="text-lg font-extrabold mt-1" style={{ color: 'var(--color-ink)' }}>{formatMontantCompact(v.montant)}</p>
                  <p className="text-xs" style={{ color: 'var(--color-ink-3)' }}>{v.count} vente(s)</p>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
