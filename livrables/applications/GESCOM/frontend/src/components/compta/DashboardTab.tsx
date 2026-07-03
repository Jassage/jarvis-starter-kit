'use client';
import { useEffect } from 'react';
import { Landmark, TrendingUp, TrendingDown, Scale, AlertTriangle } from 'lucide-react';
import { useComptaStore } from '@/stores/comptaStore';
import { formatMontant } from '@/lib/utils';
import StatCard from '@/components/ui/StatCard';

export default function DashboardTab() {
  const { dashboard, fetchDashboard } = useComptaStore();

  useEffect(() => { fetchDashboard(); }, [fetchDashboard]);

  if (!dashboard) return null;

  return (
    <div className="space-y-6">
      {!dashboard.equilibre && (
        <div className="card p-4 flex items-center gap-3" style={{ background: 'var(--color-danger-soft)', border: '1px solid rgba(220,38,38,0.25)' }}>
          <AlertTriangle className="w-5 h-5 shrink-0" style={{ color: 'var(--color-danger)' }} />
          <p className="text-sm font-semibold" style={{ color: 'var(--color-danger)' }}>
            Le bilan n&apos;est pas équilibré (Actif ≠ Passif). Vérifiez le journal et les écritures en échec.
          </p>
        </div>
      )}

      {dashboard.nbEchecsNonResolus > 0 && (
        <div className="card p-4 flex items-center gap-3" style={{ background: 'var(--color-warning-soft)', border: '1px solid rgba(217,119,6,0.25)' }}>
          <AlertTriangle className="w-5 h-5 shrink-0" style={{ color: 'var(--color-warning)' }} />
          <p className="text-sm font-semibold" style={{ color: 'var(--color-warning)' }}>
            {dashboard.nbEchecsNonResolus} écriture(s) comptable(s) en échec à réconcilier — voir l&apos;onglet Réconciliation.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-5">
        <StatCard icon={Landmark} theme="blue" label="TOTAL ACTIF" value={`${formatMontant(dashboard.totalActif)} HTG`} />
        <StatCard icon={Scale} theme="violet" label="TOTAL PASSIF" value={`${formatMontant(dashboard.totalPassif)} HTG`} />
        <StatCard icon={TrendingUp} theme="brand" label="PRODUITS (MOIS)" value={`${formatMontant(dashboard.totalProduits)} HTG`} />
        <StatCard icon={TrendingDown} theme="rose" label="CHARGES (MOIS)" value={`${formatMontant(dashboard.totalCharges)} HTG`} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
        <StatCard
          icon={dashboard.resultatNet >= 0 ? TrendingUp : TrendingDown}
          theme={dashboard.resultatNet >= 0 ? 'brand' : 'rose'}
          label="RÉSULTAT NET (MOIS)"
          value={`${dashboard.resultatNet >= 0 ? '+' : ''}${formatMontant(dashboard.resultatNet)} HTG`}
        />
        <StatCard icon={Scale} theme="blue" label="ÉCRITURES CE MOIS-CI" value={String(dashboard.nbEcrituresMois)} />
      </div>
    </div>
  );
}
