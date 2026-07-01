'use client';
import { useEffect } from 'react';
import Link from 'next/link';
import {
  Wallet, Package, AlertTriangle, ShoppingCart, Store, Warehouse, Truck,
  ArrowUpRight, ArrowDownRight, Plus, Sparkles,
} from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { useDashboardStore } from '@/stores/dashboardStore';
import { formatMontant, formatMontantCompact, formatRelativeTime } from '@/lib/utils';

const KPI_THEME = {
  green: { bg: 'linear-gradient(135deg, #16a34a, #059669)', soft: 'var(--color-primary-soft)', fg: 'var(--color-primary-2)' },
  blue: { bg: 'linear-gradient(135deg, #3b82f6, #2563eb)', soft: '#eff6ff', fg: '#2563eb' },
  amber: { bg: 'linear-gradient(135deg, #f59e0b, #d97706)', soft: 'var(--color-warning-soft)', fg: 'var(--color-warning)' },
  violet: { bg: 'linear-gradient(135deg, #8b5cf6, #7c3aed)', soft: '#f5f3ff', fg: '#7c3aed' },
} as const;

function KpiCard({
  icon: Icon, theme, label, value, sub,
}: { icon: typeof Wallet; theme: keyof typeof KPI_THEME; label: string; value: string; sub?: string }) {
  const c = KPI_THEME[theme];
  return (
    <div className="card card-hover p-5 sm:p-6 relative overflow-hidden">
      <div
        className="w-11 h-11 rounded-2xl flex items-center justify-center mb-4 text-white shadow-sm"
        style={{ background: c.bg }}
      >
        <Icon className="w-5 h-5" />
      </div>
      <p className="text-[11px] font-bold tracking-widest mb-1.5" style={{ color: 'var(--color-ink-3)' }}>{label}</p>
      <p className="text-2xl sm:text-3xl font-extrabold tracking-tight" style={{ color: 'var(--color-ink)' }}>{value}</p>
      {sub && <p className="text-xs mt-1.5" style={{ color: 'var(--color-ink-3)' }}>{sub}</p>}
    </div>
  );
}

export default function DashboardPage() {
  const { utilisateur } = useAuthStore();
  const { stats, fetchStats } = useDashboardStore();

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const today = new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  const valeurMax = Math.max(1, ...(stats?.repartitionParEmplacement.map((r) => r.valeur) ?? [1]));

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Hero */}
      <div
        className="relative overflow-hidden rounded-3xl px-6 sm:px-9 py-8 sm:py-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6"
        style={{ background: 'linear-gradient(135deg, #0a2417 0%, #15803d 55%, #16a34a 100%)' }}
      >
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.08]"
          style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '28px 28px' }}
          aria-hidden
        />
        <svg className="absolute -top-16 -right-10 opacity-[0.12] pointer-events-none" width="280" height="280" viewBox="0 0 280 280" fill="none" aria-hidden>
          <circle cx="140" cy="140" r="120" stroke="white" strokeWidth="1.5" />
          <circle cx="140" cy="140" r="75" stroke="white" strokeWidth="1.5" />
        </svg>

        <div className="relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full mb-3 text-[11px] font-bold tracking-widest" style={{ background: 'rgba(255,255,255,0.14)', color: 'white' }}>
            <Sparkles className="w-3 h-3" />
            GESTION COMMERCIALE
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            Bonjour, {utilisateur?.prenom} 👋
          </h2>
          <p className="text-sm capitalize mt-1" style={{ color: 'rgba(255,255,255,0.7)' }}>{today}</p>
        </div>

        <Link
          href="/produits"
          className="relative z-10 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl text-sm font-bold transition-transform hover:scale-[1.03] shrink-0"
          style={{ background: 'white', color: '#15803d' }}
        >
          <Plus className="w-4 h-4" />
          Nouveau produit
        </Link>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-5">
        <KpiCard
          icon={Wallet}
          theme="green"
          label="VALEUR DU STOCK"
          value={formatMontantCompact(stats?.valeurStockTotal ?? 0)}
          sub={`${formatMontant(stats?.valeurStockTotal ?? 0)} HTG au coût d'achat`}
        />
        <KpiCard
          icon={ShoppingCart}
          theme="blue"
          label="VENTES DU JOUR"
          value={formatMontantCompact(stats?.ventesDuJour?.montant ?? 0)}
          sub={`${stats?.ventesDuJour?.count ?? 0} vente(s) validée(s) aujourd'hui`}
        />
        <KpiCard
          icon={AlertTriangle}
          theme="amber"
          label="ALERTES DE STOCK"
          value={String(stats?.produitsSousAlerte ?? 0)}
          sub={stats && stats.produitsSousAlerte > 0 ? 'À traiter sur la page Stock' : 'Tout est sous contrôle'}
        />
        <KpiCard icon={Package} theme="violet" label="PRODUITS ACTIFS" value={String(stats?.totalProduits ?? 0)} />
      </div>

      {/* Commandes en attente de réception */}
      {(stats?.commandesEnAttente ?? 0) > 0 && (
        <div className="card p-4 flex items-center justify-between" style={{ background: '#eff6ff', border: '1px solid rgba(37,99,235,0.2)' }}>
          <div className="flex items-center gap-3">
            <Truck className="w-5 h-5 shrink-0" style={{ color: '#2563eb' }} />
            <p className="text-sm font-semibold" style={{ color: '#1d4ed8' }}>
              {stats!.commandesEnAttente} commande{stats!.commandesEnAttente > 1 ? 's' : ''} en attente de réception
            </p>
          </div>
          <a href="/achats" className="text-xs font-bold px-3 py-1.5 rounded-lg" style={{ background: '#2563eb', color: 'white' }}>
            Voir les achats →
          </a>
        </div>
      )}

      {/* Répartition + mouvements */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5 sm:gap-6">
        <div className="xl:col-span-2 card p-5 sm:p-6">
          <h3 className="text-sm font-bold tracking-wide mb-5" style={{ color: 'var(--color-ink)' }}>RÉPARTITION DU STOCK PAR EMPLACEMENT</h3>
          <div className="space-y-5">
            {stats?.repartitionParEmplacement.map((r) => {
              const EmpIcon = r.type === 'BOUTIQUE' ? Store : Warehouse;
              return (
                <div key={r.id}>
                  <div className="flex items-center justify-between text-sm mb-2 gap-2">
                    <span className="flex items-center gap-2 font-semibold min-w-0" style={{ color: 'var(--color-ink)' }}>
                      <span className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ background: 'var(--color-primary-soft)', color: 'var(--color-primary-2)' }}>
                        <EmpIcon className="w-3.5 h-3.5" />
                      </span>
                      <span className="truncate">{r.nom}</span>
                    </span>
                    <span className="text-xs sm:text-sm shrink-0" style={{ color: 'var(--color-ink-2)' }}>
                      {formatMontantCompact(r.valeur)} · {r.quantiteTotale} unités
                    </span>
                  </div>
                  <div className="h-2.5 rounded-full overflow-hidden" style={{ background: 'var(--color-line-2)' }}>
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${Math.max(4, (r.valeur / valeurMax) * 100)}%`, background: 'linear-gradient(90deg, #16a34a, #059669)' }}
                    />
                  </div>
                </div>
              );
            })}
            {(!stats || stats.repartitionParEmplacement.length === 0) && (
              <p className="text-sm" style={{ color: 'var(--color-ink-3)' }}>Aucun emplacement actif.</p>
            )}
          </div>
        </div>

        <div className="card p-5 sm:p-6">
          <h3 className="text-sm font-bold tracking-wide mb-4" style={{ color: 'var(--color-ink)' }}>MOUVEMENTS RÉCENTS</h3>
          <ul className="space-y-4">
            {stats?.mouvementsRecents.map((m) => {
              const positif = m.quantite > 0;
              return (
                <li key={m.id} className="flex items-start gap-3">
                  <span
                    className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                    style={{
                      background: positif ? 'var(--color-success-soft)' : 'var(--color-danger-soft)',
                      color: positif ? 'var(--color-success)' : 'var(--color-danger)',
                    }}
                  >
                    {positif ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-semibold truncate" style={{ color: 'var(--color-ink)' }}>{m.produit.nom}</span>
                      <span className="text-sm font-bold shrink-0" style={{ color: positif ? 'var(--color-success)' : 'var(--color-danger)' }}>
                        {positif ? '+' : ''}{m.quantite}
                      </span>
                    </div>
                    <p className="text-xs truncate" style={{ color: 'var(--color-ink-3)' }}>
                      {m.emplacement.nom} · {formatRelativeTime(m.createdAt)}
                    </p>
                  </div>
                </li>
              );
            })}
            {(!stats || stats.mouvementsRecents.length === 0) && (
              <li className="text-sm" style={{ color: 'var(--color-ink-3)' }}>
                Aucun mouvement encore.{' '}
                <Link href="/stock" className="font-semibold" style={{ color: 'var(--color-primary-2)' }}>Ajuster le stock →</Link>
              </li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}
