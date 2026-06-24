'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import { formatMontant } from '@/lib/utils';

interface Stats {
  totalClients: number;
  totalComptes: number;
  totalPretsEnCours: number;
  transactionsAujourdhui: number;
  transactionsEnAttente: number;
  pretsEnRetard: number;
  soldeTotal: number;
  depotsAujourdhui: number;
  retraitsAujourdhui: number;
  encoursCredit: number;
}

const Icon = ({ name, className = 'w-5 h-5' }: { name: string; className?: string }) => {
  const props = { viewBox: '0 0 24 24', fill: 'none', className, strokeWidth: 1.8, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  switch (name) {
    case 'users': return <svg {...props}><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" stroke="currentColor"/></svg>;
    case 'wallet': return <svg {...props}><path d="M21 12V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2h14a2 2 0 002-2v-1M23 12h-6a2 2 0 100 4h6v-4z" stroke="currentColor"/></svg>;
    case 'arrows': return <svg {...props}><path d="M17 3l4 4-4 4M21 7H9M7 21l-4-4 4-4M3 17h12" stroke="currentColor"/></svg>;
    case 'doc': return <svg {...props}><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z M14 2v6h6" stroke="currentColor"/></svg>;
    case 'up': return <svg {...props}><path d="M7 17l9.2-9.2M17 17V7H7" stroke="currentColor"/></svg>;
    case 'down': return <svg {...props}><path d="M17 7L7.8 16.2M7 7v10h10" stroke="currentColor"/></svg>;
    case 'alert': return <svg {...props}><path d="M10.29 3.86l-8.18 14.14a2 2 0 001.71 3h16.36a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z M12 9v4 M12 17h.01" stroke="currentColor"/></svg>;
    case 'plus': return <svg {...props}><path d="M12 5v14M5 12h14" stroke="currentColor"/></svg>;
    case 'eye': return <svg {...props}><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor"/><circle cx="12" cy="12" r="3" stroke="currentColor"/></svg>;
    default: return null;
  }
};

function KpiCard({
  label, value, sub, icon, trend, color = 'primary', href,
}: {
  label: string; value: string | number; sub?: string; icon: string;
  trend?: { value: string; positive: boolean }; color?: 'primary' | 'success' | 'warning' | 'danger';
  href?: string;
}) {
  const palette = {
    primary: { bg: '#eef2ff', icon: '#2563eb' },
    success: { bg: '#ecfdf5', icon: '#10b981' },
    warning: { bg: '#fffbeb', icon: '#f59e0b' },
    danger: { bg: '#fef2f2', icon: '#ef4444' },
  }[color];

  const borderClass = { primary: 'card-blue', success: 'card-green', warning: 'card-amber', danger: 'card-red' }[color];

  const content = (
    <div className={`card card-hover p-5 h-full ${borderClass}`}>
      <div className="flex items-start justify-between mb-3">
        <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: palette.bg, color: palette.icon }}>
          <Icon name={icon} />
        </div>
        {trend && (
          <div className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold" style={{ background: trend.positive ? '#ecfdf5' : '#fef2f2', color: trend.positive ? '#047857' : '#b91c1c' }}>
            <Icon name={trend.positive ? 'up' : 'down'} className="w-3 h-3" />
            <span>{trend.value}</span>
          </div>
        )}
      </div>
      <p className="text-sm font-medium mb-1" style={{ color: '#8b94b0' }}>{label}</p>
      <p className="text-2xl font-bold tracking-tight" style={{ color: '#0b1733' }}>{value}</p>
      {sub && <p className="text-xs mt-1" style={{ color: '#8b94b0' }}>{sub}</p>}
    </div>
  );
  return href ? <Link href={href}>{content}</Link> : content;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/stats/dashboard')
      .then(({ data }) => { setStats(data.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="card p-5 h-32 animate-pulse-soft" style={{ background: '#f0f2f9' }}></div>
        ))}
      </div>
    );
  }

  if (!stats) return null;

  const netJour = stats.depotsAujourdhui - stats.retraitsAujourdhui;

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Hero balance */}
      <div className="relative overflow-hidden rounded-2xl p-6 lg:p-8" style={{ background: 'linear-gradient(135deg, #0b1733 0%, #1e3a8a 60%, #2563eb 100%)' }}>
        <div className="absolute -right-20 -top-20 w-60 h-60 rounded-full" style={{ background: 'rgba(255,255,255,0.05)' }}></div>
        <div className="absolute right-10 -bottom-10 w-40 h-40 rounded-full" style={{ background: 'rgba(255,255,255,0.04)' }}></div>

        <div className="relative grid lg:grid-cols-2 gap-6">
          <div>
            <p className="text-blue-200 text-sm font-medium mb-2">SOLDE TOTAL DES COMPTES CLIENTS</p>
            <p className="text-white text-4xl lg:text-5xl font-bold tracking-tight">{formatMontant(stats.soldeTotal, 'HTG')}</p>
            <p className="text-blue-200 text-sm mt-2">Encours crédit : <span className="font-semibold text-white">{formatMontant(stats.encoursCredit, 'HTG')}</span></p>

            <div className="flex gap-3 mt-6">
              <Link href="/transactions" className="px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all hover:scale-105" style={{ background: 'white', color: '#1e3a8a' }}>
                <Icon name="plus" className="w-4 h-4" /> Nouvelle transaction
              </Link>
              <Link href="/clients" className="px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all" style={{ background: 'rgba(255,255,255,0.15)', color: 'white', backdropFilter: 'blur(10px)' }}>
                <Icon name="users" className="w-4 h-4" /> Voir les clients
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 lg:gap-4">
            <div className="rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)' }}>
              <div className="flex items-center gap-2 mb-2 text-emerald-300">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'rgba(16, 185, 129, 0.25)' }}>
                  <Icon name="up" className="w-4 h-4" />
                </div>
                <span className="text-xs font-medium">Dépôts du jour</span>
              </div>
              <p className="text-white text-xl font-bold">{formatMontant(stats.depotsAujourdhui, 'HTG')}</p>
            </div>
            <div className="rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)' }}>
              <div className="flex items-center gap-2 mb-2 text-red-300">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'rgba(239, 68, 68, 0.25)' }}>
                  <Icon name="down" className="w-4 h-4" />
                </div>
                <span className="text-xs font-medium">Retraits du jour</span>
              </div>
              <p className="text-white text-xl font-bold">{formatMontant(stats.retraitsAujourdhui, 'HTG')}</p>
            </div>
            <div className="col-span-2 rounded-2xl p-4 flex items-center justify-between" style={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)' }}>
              <div>
                <p className="text-xs text-blue-200 mb-1">NET DU JOUR</p>
                <p className={`text-2xl font-bold ${netJour >= 0 ? 'text-emerald-300' : 'text-red-300'}`}>
                  {netJour >= 0 ? '+' : ''}{formatMontant(netJour, 'HTG')}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-blue-200 mb-1">OPÉRATIONS</p>
                <p className="text-2xl font-bold text-white">{stats.transactionsAujourdhui}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* KPI grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label="Clients actifs"
          value={stats.totalClients.toLocaleString('fr')}
          icon="users"
          color="primary"
          href="/clients"
          sub="Base totale"
        />
        <KpiCard
          label="Comptes ouverts"
          value={stats.totalComptes.toLocaleString('fr')}
          icon="wallet"
          color="success"
          href="/comptes"
          sub="Tous statuts confondus"
        />
        <KpiCard
          label="Prêts actifs"
          value={stats.totalPretsEnCours.toLocaleString('fr')}
          icon="doc"
          color={stats.pretsEnRetard > 0 ? 'warning' : 'primary'}
          href="/prets"
          sub={stats.pretsEnRetard > 0 ? `${stats.pretsEnRetard} en retard` : 'Aucun retard'}
        />
        <KpiCard
          label="En attente"
          value={stats.transactionsEnAttente.toLocaleString('fr')}
          icon="arrows"
          color={stats.transactionsEnAttente > 0 ? 'danger' : 'primary'}
          href="/transactions"
          sub="À valider par un superviseur"
        />
      </div>

      {/* Activity panels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Quick actions */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold tracking-tight" style={{ color: '#0b1733' }}>Actions rapides</h3>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: 'Nouveau client', href: '/clients', icon: 'users', color: '#2563eb' },
              { label: 'Ouvrir compte', href: '/comptes', icon: 'wallet', color: '#10b981' },
              { label: 'Dépôt / Retrait', href: '/transactions', icon: 'arrows', color: '#f59e0b' },
              { label: 'Nouveau prêt', href: '/prets', icon: 'doc', color: '#8b5cf6' },
            ].map((a) => (
              <Link key={a.label} href={a.href} className="flex flex-col items-start gap-2 p-3 rounded-xl transition-all hover:scale-[1.02]" style={{ background: '#f7f8fc' }}>
                <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: `${a.color}15`, color: a.color }}>
                  <Icon name={a.icon} className="w-4 h-4" />
                </div>
                <span className="text-xs font-semibold leading-tight" style={{ color: '#0b1733' }}>{a.label}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Today summary */}
        <div className="card p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold tracking-tight" style={{ color: '#0b1733' }}>Activité d'aujourd'hui</h3>
            <Link href="/transactions" className="text-xs font-semibold flex items-center gap-1" style={{ color: '#2563eb' }}>
              Tout voir <span>→</span>
            </Link>
          </div>

          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="p-3 rounded-xl" style={{ background: '#ecfdf5' }}>
              <p className="text-xs font-medium mb-1" style={{ color: '#047857' }}>Entrées</p>
              <p className="font-bold tracking-tight" style={{ color: '#047857' }}>{formatMontant(stats.depotsAujourdhui, 'HTG')}</p>
            </div>
            <div className="p-3 rounded-xl" style={{ background: '#fef2f2' }}>
              <p className="text-xs font-medium mb-1" style={{ color: '#b91c1c' }}>Sorties</p>
              <p className="font-bold tracking-tight" style={{ color: '#b91c1c' }}>{formatMontant(stats.retraitsAujourdhui, 'HTG')}</p>
            </div>
            <div className="p-3 rounded-xl" style={{ background: netJour >= 0 ? '#eef2ff' : '#fef2f2' }}>
              <p className="text-xs font-medium mb-1" style={{ color: netJour >= 0 ? '#1e40af' : '#b91c1c' }}>Net</p>
              <p className="font-bold tracking-tight" style={{ color: netJour >= 0 ? '#1e40af' : '#b91c1c' }}>
                {netJour >= 0 ? '+' : ''}{formatMontant(netJour, 'HTG')}
              </p>
            </div>
          </div>

          {stats.transactionsEnAttente > 0 && (
            <div className="flex items-start gap-3 p-4 rounded-xl" style={{ background: '#fffbeb', border: '1px solid #fde68a' }}>
              <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: '#fef3c7', color: '#b45309' }}>
                <Icon name="alert" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold" style={{ color: '#92400e' }}>
                  {stats.transactionsEnAttente} transaction{stats.transactionsEnAttente > 1 ? 's' : ''} en attente
                </p>
                <p className="text-xs mt-0.5" style={{ color: '#b45309' }}>Validation requise par un superviseur</p>
              </div>
              <Link href="/transactions?statut=EN_ATTENTE" className="px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap" style={{ background: '#b45309', color: 'white' }}>
                Examiner
              </Link>
            </div>
          )}

          {stats.transactionsEnAttente === 0 && (
            <div className="flex items-center gap-3 p-4 rounded-xl" style={{ background: '#ecfdf5' }}>
              <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: '#d1fae5', color: '#047857' }}>
                <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5"><path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </div>
              <div>
                <p className="text-sm font-semibold" style={{ color: '#047857' }}>Tout est à jour</p>
                <p className="text-xs" style={{ color: '#059669' }}>Aucune transaction en attente de validation</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
