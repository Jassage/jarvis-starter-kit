'use client';
import { useEffect } from 'react';
import { Warehouse, TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react';
import { useRapportStore } from '@/stores/rapportStore';
import { formatMontant, formatMontantCompact } from '@/lib/utils';
import StatCard from '@/components/ui/StatCard';
import Badge from '@/components/ui/Badge';
import EmptyState from '@/components/ui/EmptyState';

export default function StockTab() {
  const { stock, fetchStock } = useRapportStore();

  useEffect(() => { fetchStock(); }, [fetchStock]);

  if (!stock) return null;

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
        <StatCard icon={Warehouse} theme="brand" label="VALEUR DU STOCK" value={`${formatMontant(stock.valeurStockTotal)} HTG`} />
        <StatCard icon={TrendingUp} theme="blue" label="PRODUITS À ROTATION" value={String(stock.meilleureRotation.length)} sub="Vendus sur 90 jours" />
        <StatCard icon={AlertTriangle} theme="rose" label="PRODUITS EN ALERTE" value={String(stock.alertesStock.length)} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
        <div className="card overflow-hidden">
          <div className="px-4 py-3 font-bold text-sm" style={{ background: 'var(--color-primary-soft)', color: 'var(--color-primary-2)' }}>VALORISATION PAR EMPLACEMENT</div>
          <table className="w-full table-shell">
            <tbody>
              {stock.valorisationParEmplacement.map((e) => (
                <tr key={e.id}>
                  <td>
                    <p className="font-semibold" style={{ color: 'var(--color-ink)' }}>{e.nom}</p>
                    <p className="text-xs" style={{ color: 'var(--color-ink-3)' }}>{e.quantite} unités</p>
                  </td>
                  <td className="text-right font-semibold whitespace-nowrap" style={{ color: 'var(--color-ink)' }}>{formatMontantCompact(e.valeur)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {stock.valorisationParEmplacement.length === 0 && <EmptyState title="Aucun stock" />}
        </div>

        <div className="card overflow-hidden">
          <div className="px-4 py-3 font-bold text-sm" style={{ background: 'var(--color-violet-soft)', color: 'var(--color-violet)' }}>VALORISATION PAR CATÉGORIE</div>
          <table className="w-full table-shell">
            <tbody>
              {stock.valorisationParCategorie.map((c) => (
                <tr key={c.categorie}>
                  <td>
                    <p className="font-semibold" style={{ color: 'var(--color-ink)' }}>{c.categorie}</p>
                    <p className="text-xs" style={{ color: 'var(--color-ink-3)' }}>{c.quantite} unités</p>
                  </td>
                  <td className="text-right font-semibold whitespace-nowrap" style={{ color: 'var(--color-ink)' }}>{formatMontantCompact(c.valeur)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {stock.valorisationParCategorie.length === 0 && <EmptyState title="Aucun stock" />}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
        <div className="card overflow-hidden">
          <div className="px-4 py-3 font-bold text-sm flex items-center gap-2" style={{ background: 'var(--color-success-soft)', color: 'var(--color-success)' }}>
            <TrendingUp className="w-4 h-4" /> MEILLEURE ROTATION (90 J)
          </div>
          <table className="w-full table-shell">
            <tbody>
              {stock.meilleureRotation.map((p) => (
                <tr key={p.produitId}>
                  <td>
                    <p className="font-semibold" style={{ color: 'var(--color-ink)' }}>{p.nom}</p>
                    <p className="text-xs" style={{ color: 'var(--color-ink-3)' }}>{p.reference} · stock {p.quantiteStock}</p>
                  </td>
                  <td className="text-right font-semibold whitespace-nowrap" style={{ color: 'var(--color-ink)' }}>{p.quantiteSortie90j} vendus</td>
                </tr>
              ))}
            </tbody>
          </table>
          {stock.meilleureRotation.length === 0 && <EmptyState title="Aucune sortie sur 90 jours" />}
        </div>

        <div className="card overflow-hidden">
          <div className="px-4 py-3 font-bold text-sm flex items-center gap-2" style={{ background: 'var(--color-danger-soft)', color: 'var(--color-danger)' }}>
            <TrendingDown className="w-4 h-4" /> PRODUITS DORMANTS (0 SORTIE / 90 J)
          </div>
          <table className="w-full table-shell">
            <tbody>
              {stock.produitsDormants.map((p) => (
                <tr key={p.produitId}>
                  <td>
                    <p className="font-semibold" style={{ color: 'var(--color-ink)' }}>{p.nom}</p>
                    <p className="text-xs" style={{ color: 'var(--color-ink-3)' }}>{p.reference}</p>
                  </td>
                  <td className="text-right font-semibold whitespace-nowrap" style={{ color: 'var(--color-ink)' }}>{p.quantiteStock} en stock</td>
                </tr>
              ))}
            </tbody>
          </table>
          {stock.produitsDormants.length === 0 && <EmptyState title="Aucun produit dormant" hint="Tous les produits en stock ont eu au moins une sortie sur 90 jours" />}
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="px-4 py-3 font-bold text-sm" style={{ background: 'var(--color-warning-soft)', color: 'var(--color-warning)' }}>ALERTES DE STOCK</div>
        <table className="w-full table-shell">
          <tbody>
            {stock.alertesStock.map((a) => (
              <tr key={`${a.produitId}-${a.emplacement}`}>
                <td>
                  <p className="font-semibold" style={{ color: 'var(--color-ink)' }}>{a.nom}</p>
                  <p className="text-xs" style={{ color: 'var(--color-ink-3)' }}>{a.reference} · {a.emplacement}</p>
                </td>
                <td className="text-right whitespace-nowrap">
                  <Badge tone="danger">{a.quantite} / seuil {a.seuilAlerte}</Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {stock.alertesStock.length === 0 && <EmptyState title="Aucune alerte de stock" />}
      </div>
    </div>
  );
}
