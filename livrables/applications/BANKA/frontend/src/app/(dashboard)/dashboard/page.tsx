'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import { formatMontant, formatMontantCompact } from '@/lib/utils';

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

interface Alertes {
  txEnAttente: number;
  pretsEnRetard: number;
  echeancesAujourdhui: number;
  total: number;
}

interface TxRecente {
  id: string; reference: string; type: string;
  montant: number; devise: string; createdAt: string;
  statut: string;
  compteDebit?: { numeroCompte: string };
  compteCredit?: { numeroCompte: string };
}

interface TendancePoint { date: string; depots: number; retraits: number; }

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
    default: return null;
  }
};

function KpiCard({ label, value, sub, icon, color = 'primary', href }: {
  label: string; value: string | number; sub?: string; icon: string;
  color?: 'primary' | 'success' | 'warning' | 'danger'; href?: string;
}) {
  const palette = {
    primary: { bg: '#eef2ff', icon: '#2563eb' },
    success: { bg: '#ecfdf5', icon: '#10b981' },
    warning: { bg: '#fffbeb', icon: '#f59e0b' },
    danger:  { bg: '#fef2f2', icon: '#ef4444' },
  }[color];
  const borderClass = { primary: 'card-blue', success: 'card-green', warning: 'card-amber', danger: 'card-red' }[color];
  const content = (
    <div className={`card card-hover p-5 h-full ${borderClass}`}>
      <div className="flex items-start justify-between mb-3">
        <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: palette.bg, color: palette.icon }}>
          <Icon name={icon} />
        </div>
      </div>
      <p className="text-sm font-medium mb-1" style={{ color: '#8b94b0' }}>{label}</p>
      <p className="text-2xl font-bold tracking-tight" style={{ color: '#0b1733' }}>{value}</p>
      {sub && <p className="text-xs mt-1" style={{ color: '#8b94b0' }}>{sub}</p>}
    </div>
  );
  return href ? <Link href={href}>{content}</Link> : content;
}

function TendanceChart({ data }: { data: TendancePoint[] }) {
  if (!data.length) return null;

  const maxVal = Math.max(...data.flatMap((d) => [d.depots, d.retraits]), 1);
  const W = 580; const H = 120; const BAR_W = 16; const GAP = 20;
  const groupW = BAR_W * 2 + GAP;
  const totalW = data.length * groupW;
  const startX = (W - totalW) / 2;
  const BOTTOM_PAD = 28; const TOP_PAD = 8;
  const chartH = H - BOTTOM_PAD - TOP_PAD;

  const barH = (v: number) => Math.max(2, (v / maxVal) * chartH);

  const dayLabels = data.map((d) => {
    const dt = new Date(d.date + 'T12:00:00');
    return dt.toLocaleDateString('fr-FR', { weekday: 'short' }).slice(0, 3);
  });

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ overflow: 'visible' }}>
      {data.map((d, i) => {
        const x = startX + i * groupW;
        const hD = barH(d.depots);
        const hR = barH(d.retraits);
        const isLast = i === data.length - 1;
        return (
          <g key={d.date}>
            {/* dépôt */}
            <rect
              x={x} y={TOP_PAD + chartH - hD} width={BAR_W} height={hD}
              rx="3" fill={isLast ? '#10b981' : '#93c5fd'}
            />
            {/* retrait */}
            <rect
              x={x + BAR_W + 4} y={TOP_PAD + chartH - hR} width={BAR_W} height={hR}
              rx="3" fill={isLast ? '#f87171' : '#fca5a5'}
            />
            {/* label jour */}
            <text x={x + BAR_W + 2} y={H - 6} textAnchor="middle" fontSize="9" fill="#8b94b0">{dayLabels[i]}</text>
          </g>
        );
      })}
      {/* légende */}
      <rect x={startX} y={H - 6} width={8} height={8} rx="2" fill="#93c5fd" />
      <text x={startX + 11} y={H + 3} fontSize="9" fill="#8b94b0">Dépôts</text>
      <rect x={startX + 70} y={H - 6} width={8} height={8} rx="2" fill="#fca5a5" />
      <text x={startX + 81} y={H + 3} fontSize="9" fill="#8b94b0">Retraits</text>
    </svg>
  );
}

const TX_TYPE_CONFIG: Record<string, { label: string; color: string; sign: string }> = {
  DEPOT:             { label: 'Dépôt',     color: '#047857', sign: '+' },
  RETRAIT:           { label: 'Retrait',   color: '#b91c1c', sign: '-' },
  VIREMENT_DEBIT:    { label: 'Virement',  color: '#1d4ed8', sign: '-' },
  VIREMENT_CREDIT:   { label: 'Virement',  color: '#1d4ed8', sign: '+' },
  REMBOURSEMENT_PRET:{ label: 'Rembt.',    color: '#6d28d9', sign: '-' },
};

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [alertes, setAlertes] = useState<Alertes | null>(null);
  const [tendance, setTendance] = useState<TendancePoint[]>([]);
  const [txRecentes, setTxRecentes] = useState<TxRecente[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/stats/dashboard'),
      api.get('/stats/tendance?jours=7'),
      api.get('/stats/alertes'),
      api.get('/transactions?limit=5&statut=VALIDEE'),
    ]).then(([s, t, a, tx]) => {
      setStats(s.data.data);
      setTendance(t.data.data);
      setAlertes(a.data.data);
      setTxRecentes(tx.data.data?.items || []);
      setLoading(false);
    }).catch(() => setLoading(false));
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
            <p title={formatMontant(stats.soldeTotal, 'HTG')} className="text-white text-4xl lg:text-5xl font-bold tracking-tight">{formatMontantCompact(stats.soldeTotal, 'HTG')}</p>
            <p className="text-blue-200 text-sm mt-2">Encours crédit : <span title={formatMontant(stats.encoursCredit, 'HTG')} className="font-semibold text-white">{formatMontantCompact(stats.encoursCredit, 'HTG')}</span></p>
            <div className="flex gap-3 mt-6">
              <Link href="/transactions" className="px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all hover:scale-105" style={{ background: 'white', color: '#1e3a8a' }}>
                <Icon name="plus" className="w-4 h-4" /> Nouvelle transaction
              </Link>
              <Link href="/clients" className="px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2" style={{ background: 'rgba(255,255,255,0.15)', color: 'white', backdropFilter: 'blur(10px)' }}>
                <Icon name="users" className="w-4 h-4" /> Voir les clients
              </Link>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 lg:gap-4">
            <div className="rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)' }}>
              <div className="flex items-center gap-2 mb-2 text-emerald-300">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'rgba(16,185,129,0.25)' }}>
                  <Icon name="up" className="w-4 h-4" />
                </div>
                <span className="text-xs font-medium">Dépôts du jour</span>
              </div>
              <p title={formatMontant(stats.depotsAujourdhui, 'HTG')} className="text-white text-xl font-bold">{formatMontantCompact(stats.depotsAujourdhui, 'HTG')}</p>
            </div>
            <div className="rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)' }}>
              <div className="flex items-center gap-2 mb-2 text-red-300">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'rgba(239,68,68,0.25)' }}>
                  <Icon name="down" className="w-4 h-4" />
                </div>
                <span className="text-xs font-medium">Retraits du jour</span>
              </div>
              <p title={formatMontant(stats.retraitsAujourdhui, 'HTG')} className="text-white text-xl font-bold">{formatMontantCompact(stats.retraitsAujourdhui, 'HTG')}</p>
            </div>
            <div className="col-span-2 rounded-2xl p-4 flex items-center justify-between" style={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)' }}>
              <div>
                <p className="text-xs text-blue-200 mb-1">NET DU JOUR</p>
                <p title={formatMontant(netJour, 'HTG')} className={`text-2xl font-bold ${netJour >= 0 ? 'text-emerald-300' : 'text-red-300'}`}>
                  {netJour >= 0 ? '+' : ''}{formatMontantCompact(netJour, 'HTG')}
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
        <KpiCard label="Clients actifs" value={stats.totalClients.toLocaleString('fr')} icon="users" color="primary" href="/clients" sub="Base totale" />
        <KpiCard label="Comptes ouverts" value={stats.totalComptes.toLocaleString('fr')} icon="wallet" color="success" href="/comptes" sub="Tous statuts confondus" />
        <KpiCard label="Prêts actifs" value={stats.totalPretsEnCours.toLocaleString('fr')} icon="doc" color={stats.pretsEnRetard > 0 ? 'warning' : 'primary'} href="/prets" sub={stats.pretsEnRetard > 0 ? `${stats.pretsEnRetard} en retard` : 'Aucun retard'} />
        <KpiCard label="En attente" value={stats.transactionsEnAttente.toLocaleString('fr')} icon="arrows" color={stats.transactionsEnAttente > 0 ? 'danger' : 'primary'} href="/transactions" sub="À valider par un superviseur" />
      </div>

      {/* Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Quick actions */}
        <div className="card p-5">
          <h3 className="font-bold tracking-tight mb-4" style={{ color: '#0b1733' }}>Actions rapides</h3>
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

        {/* Tendance 7 jours */}
        <div className="card p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold tracking-tight" style={{ color: '#0b1733' }}>Tendance — 7 derniers jours</h3>
              <p className="text-xs mt-0.5" style={{ color: '#8b94b0' }}>Dépôts vs Retraits validés (HTG)</p>
            </div>
            <Link href="/rapports" className="text-xs font-semibold flex items-center gap-1" style={{ color: '#2563eb' }}>
              Rapports complets <span>→</span>
            </Link>
          </div>

          {tendance.length > 0 ? (
            <div className="mt-2">
              <TendanceChart data={tendance} />
              <div className="grid grid-cols-2 gap-3 mt-4">
                <div className="p-3 rounded-xl" style={{ background: '#ecfdf5' }}>
                  <p className="text-xs font-medium mb-1" style={{ color: '#047857' }}>Total dépôts (7j)</p>
                  <p title={formatMontant(tendance.reduce((s, d) => s + d.depots, 0), 'HTG')} className="font-bold" style={{ color: '#047857' }}>
                    {formatMontantCompact(tendance.reduce((s, d) => s + d.depots, 0), 'HTG')}
                  </p>
                </div>
                <div className="p-3 rounded-xl" style={{ background: '#fef2f2' }}>
                  <p className="text-xs font-medium mb-1" style={{ color: '#b91c1c' }}>Total retraits (7j)</p>
                  <p title={formatMontant(tendance.reduce((s, d) => s + d.retraits, 0), 'HTG')} className="font-bold" style={{ color: '#b91c1c' }}>
                    {formatMontantCompact(tendance.reduce((s, d) => s + d.retraits, 0), 'HTG')}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center py-8">
              <p className="text-sm" style={{ color: '#8b94b0' }}>Aucune donnée disponible</p>
            </div>
          )}

          {stats.transactionsEnAttente > 0 && (
            <div className="flex items-start gap-3 p-4 rounded-xl mt-4" style={{ background: '#fffbeb', border: '1px solid #fde68a' }}>
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
          {alertes && alertes.echeancesAujourdhui > 0 && (
            <div className="flex items-start gap-3 p-4 rounded-xl mt-3" style={{ background: '#fef2f2', border: '1px solid #fecaca' }}>
              <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: '#fee2e2', color: '#b91c1c' }}>
                <Icon name="doc" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold" style={{ color: '#991b1b' }}>
                  {alertes.echeancesAujourdhui} échéance{alertes.echeancesAujourdhui > 1 ? 's' : ''} à encaisser aujourd'hui
                </p>
                <p className="text-xs mt-0.5" style={{ color: '#b91c1c' }}>Prêts avec mensualité due à la date du jour</p>
              </div>
              <Link href="/prets?statut=EN_COURS" className="px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap" style={{ background: '#b91c1c', color: 'white' }}>
                Voir les prêts
              </Link>
            </div>
          )}
          {alertes && alertes.pretsEnRetard > 0 && (
            <div className="flex items-start gap-3 p-4 rounded-xl mt-3" style={{ background: '#fef2f2', border: '1px solid #fecaca' }}>
              <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: '#fee2e2', color: '#b91c1c' }}>
                <Icon name="alert" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold" style={{ color: '#991b1b' }}>
                  {alertes.pretsEnRetard} prêt{alertes.pretsEnRetard > 1 ? 's' : ''} en retard de paiement
                </p>
                <p className="text-xs mt-0.5" style={{ color: '#b91c1c' }}>Des pénalités de retard s'accumulent</p>
              </div>
              <Link href="/prets?statut=EN_RETARD" className="px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap" style={{ background: '#b91c1c', color: 'white' }}>
                Gérer
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Transactions récentes */}
      {txRecentes.length > 0 && (
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold tracking-tight" style={{ color: '#0b1733' }}>Dernières transactions</h3>
            <Link href="/transactions" className="text-xs font-semibold flex items-center gap-1" style={{ color: '#2563eb' }}>
              Tout voir <span>→</span>
            </Link>
          </div>
          <div className="space-y-1">
            {txRecentes.map((tx) => {
              const cfg = TX_TYPE_CONFIG[tx.type] ?? { label: tx.type, color: '#4a5578', sign: '' };
              const compte = tx.compteCredit?.numeroCompte || tx.compteDebit?.numeroCompte || '—';
              return (
                <div key={tx.id} className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 transition-colors">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: `${cfg.color}15`, color: cfg.color }}>
                    <Icon name={tx.type === 'DEPOT' ? 'up' : tx.type === 'RETRAIT' ? 'down' : 'arrows'} className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold truncate" style={{ color: '#0b1733' }}>{cfg.label} · {compte}</p>
                    <p className="text-xs" style={{ color: '#8b94b0' }}>{tx.reference}</p>
                  </div>
                  <p className="text-sm font-bold flex-shrink-0" style={{ color: cfg.color }}>
                    {cfg.sign}{formatMontant(tx.montant, tx.devise)}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
