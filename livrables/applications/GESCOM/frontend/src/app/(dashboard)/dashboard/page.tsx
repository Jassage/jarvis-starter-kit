'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Wallet, Package, AlertTriangle, ShoppingCart, Store, Warehouse, Truck,
  ArrowUpRight, ArrowDownRight, Plus, Sparkles, TrendingUp, TrendingDown, Minus,
  Wrench, CreditCard, Trophy, Users, CheckCircle2,
} from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { useDashboardStore } from '@/stores/dashboardStore';
import { formatMontant, formatMontantCompact, formatRelativeTime } from '@/lib/utils';
import Modal from '@/components/ui/Modal';
import NouvelleVenteModal from '@/components/ventes/NouvelleVenteModal';
import NouvelleCommandeModal from '@/components/achats/NouvelleCommandeModal';
import QuickAjustementModal from '@/components/stock/QuickAjustementModal';

const ROLES_VENTE = ['SUPER_ADMIN', 'GERANT', 'VENDEUR'];
const ROLES_STOCK = ['SUPER_ADMIN', 'GERANT', 'MAGASINIER'];

const KPI_THEME = {
  green: { bg: 'linear-gradient(135deg, #16a34a, #059669)' },
  blue: { bg: 'linear-gradient(135deg, #3b82f6, #2563eb)' },
  amber: { bg: 'linear-gradient(135deg, #f59e0b, #d97706)' },
  violet: { bg: 'linear-gradient(135deg, #8b5cf6, #7c3aed)' },
  rose: { bg: 'linear-gradient(135deg, #f43f5e, #e11d48)' },
} as const;

function TrendBadge({ pct }: { pct: number }) {
  const Icon = pct > 0 ? TrendingUp : pct < 0 ? TrendingDown : Minus;
  const color = pct > 0 ? 'var(--color-success)' : pct < 0 ? 'var(--color-danger)' : 'var(--color-ink-3)';
  const bg = pct > 0 ? 'var(--color-success-soft)' : pct < 0 ? 'var(--color-danger-soft)' : 'var(--color-line-2)';
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold" style={{ background: bg, color }}>
      <Icon className="w-3 h-3" />
      {pct > 0 ? '+' : ''}{pct}%
    </span>
  );
}

function KpiCard({
  icon: Icon, theme, label, value, sub, trend,
}: {
  icon: typeof Wallet; theme: keyof typeof KPI_THEME; label: string; value: string; sub?: string; trend?: number;
}) {
  const c = KPI_THEME[theme];
  return (
    <div className="card card-hover p-5 sm:p-6 relative overflow-hidden">
      <div className="flex items-center justify-between mb-4">
        <div className="w-11 h-11 rounded-2xl flex items-center justify-center text-white shadow-sm" style={{ background: c.bg }}>
          <Icon className="w-5 h-5" />
        </div>
        {trend !== undefined && <TrendBadge pct={trend} />}
      </div>
      <p className="text-[11px] font-bold tracking-widest mb-1.5" style={{ color: 'var(--color-ink-3)' }}>{label}</p>
      <p className="text-2xl sm:text-3xl font-extrabold tracking-tight" style={{ color: 'var(--color-ink)' }}>{value}</p>
      {sub && <p className="text-xs mt-1.5" style={{ color: 'var(--color-ink-3)' }}>{sub}</p>}
    </div>
  );
}

const RANG_STYLE = [
  { bg: '#fef3c7', fg: '#b45309' }, // or
  { bg: '#e5e7eb', fg: '#4b5563' }, // argent
  { bg: '#fed7aa', fg: '#c2410c' }, // bronze
];

export default function DashboardPage() {
  const { utilisateur } = useAuthStore();
  const { stats, fetchStats } = useDashboardStore();
  const [action, setAction] = useState<'vente' | 'stock' | 'achat' | null>(null);
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    if (!success) return;
    const t = setTimeout(() => setSuccess(''), 4500);
    return () => clearTimeout(t);
  }, [success]);

  const role = utilisateur?.role;
  const peutVendre = !!role && ROLES_VENTE.includes(role);
  const peutGererStock = !!role && ROLES_STOCK.includes(role);

  const handleDone = (message: string) => {
    setAction(null);
    setSuccess(message);
    fetchStats();
  };

  const today = new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  const valeurMax = Math.max(1, ...(stats?.repartitionParEmplacement.map((r) => r.valeur) ?? [1]));
  const venteMax = Math.max(1, ...(stats?.ventes7Jours.map((v) => v.montant) ?? [1]));
  const produitMax = Math.max(1, ...(stats?.topProduits.map((p) => p.montantVendu) ?? [1]));

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Bannière succès (remplace les alert() natifs) */}
      {success && (
        <div className="card p-4 flex items-center gap-3" style={{ background: 'var(--color-success-soft)', border: '1px solid rgba(16,185,129,0.25)' }}>
          <CheckCircle2 className="w-5 h-5 shrink-0" style={{ color: 'var(--color-success)' }} />
          <p className="text-sm font-semibold" style={{ color: 'var(--color-success)' }}>{success}</p>
        </div>
      )}

      {/* Hero */}
      <div
        className="relative overflow-hidden rounded-3xl px-6 sm:px-9 py-8 sm:py-10 flex flex-col gap-6"
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

        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full mb-3 text-[11px] font-bold tracking-widest" style={{ background: 'rgba(255,255,255,0.14)', color: 'white' }}>
              <Sparkles className="w-3 h-3" />
              GESTION COMMERCIALE
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              Bonjour, {utilisateur?.prenom} 👋
            </h2>
            <p className="text-sm capitalize mt-1" style={{ color: 'rgba(255,255,255,0.7)' }}>{today}</p>
          </div>
        </div>

        {/* Actions rapides */}
        {(peutVendre || peutGererStock) && (
          <div className="relative z-10 flex flex-wrap gap-2.5">
            {peutVendre && (
              <button
                onClick={() => setAction('vente')}
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl text-sm font-bold transition-transform hover:scale-[1.03]"
                style={{ background: 'white', color: '#15803d' }}
              >
                <Plus className="w-4 h-4" />
                Nouvelle vente
              </button>
            )}
            {peutGererStock && (
              <button
                onClick={() => setAction('stock')}
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl text-sm font-bold transition-transform hover:scale-[1.03]"
                style={{ background: 'rgba(255,255,255,0.14)', color: 'white', border: '1px solid rgba(255,255,255,0.25)' }}
              >
                <Wrench className="w-4 h-4" />
                Ajuster le stock
              </button>
            )}
            {peutGererStock && (
              <button
                onClick={() => setAction('achat')}
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl text-sm font-bold transition-transform hover:scale-[1.03]"
                style={{ background: 'rgba(255,255,255,0.14)', color: 'white', border: '1px solid rgba(255,255,255,0.25)' }}
              >
                <Truck className="w-4 h-4" />
                Nouvelle commande
              </button>
            )}
          </div>
        )}
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4 sm:gap-5">
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
          sub={`${stats?.ventesDuJour?.count ?? 0} vente(s) validée(s)`}
          trend={stats?.tendanceVentes?.variationPct}
        />
        <KpiCard
          icon={CreditCard}
          theme="rose"
          label="ENCOURS CRÉDIT CLIENTS"
          value={formatMontantCompact(stats?.encoursCreditTotal ?? 0)}
          sub={stats && stats.clientsRisque.length > 0 ? `${stats.clientsRisque.length} client(s) à solde positif` : 'Aucun encours'}
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
      {stats && stats.commandesEnAttente > 0 && (
        <div
          className="card p-4 flex items-center justify-between gap-3 flex-wrap"
          style={{
            background: stats.commandesEnRetard > 0 ? 'var(--color-danger-soft)' : '#eff6ff',
            border: `1px solid ${stats.commandesEnRetard > 0 ? 'rgba(239,68,68,0.25)' : 'rgba(37,99,235,0.2)'}`,
          }}
        >
          <div className="flex items-center gap-3">
            <Truck className="w-5 h-5 shrink-0" style={{ color: stats.commandesEnRetard > 0 ? 'var(--color-danger)' : '#2563eb' }} />
            <p className="text-sm font-semibold" style={{ color: stats.commandesEnRetard > 0 ? 'var(--color-danger)' : '#1d4ed8' }}>
              {stats.commandesEnAttente} commande{stats.commandesEnAttente > 1 ? 's' : ''} en attente de réception
              {stats.commandesEnRetard > 0 && ` · ${stats.commandesEnRetard} en retard sur la livraison prévue`}
            </p>
          </div>
          <Link
            href="/achats"
            className="text-xs font-bold px-3 py-1.5 rounded-lg shrink-0"
            style={{ background: stats.commandesEnRetard > 0 ? 'var(--color-danger)' : '#2563eb', color: 'white' }}
          >
            Voir les achats →
          </Link>
        </div>
      )}

      {/* Ventes 7 jours + Répartition stock */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5 sm:gap-6">
        <div className="xl:col-span-2 card p-5 sm:p-6">
          <h3 className="text-sm font-bold tracking-wide mb-5" style={{ color: 'var(--color-ink)' }}>VENTES DES 7 DERNIERS JOURS</h3>
          <div className="flex items-end justify-between gap-2 sm:gap-3 h-40">
            {stats?.ventes7Jours.map((v) => {
              const hauteurPct = Math.max(4, (v.montant / venteMax) * 100);
              const jour = new Date(v.date + 'T12:00:00').toLocaleDateString('fr-FR', { weekday: 'short' });
              return (
                <div key={v.date} className="flex-1 flex flex-col items-center justify-end h-full gap-2">
                  <span className="text-[11px] font-semibold" style={{ color: 'var(--color-ink-2)' }}>
                    {v.montant > 0 ? formatMontantCompact(v.montant).replace(' HTG', '') : ''}
                  </span>
                  <div
                    className="w-full rounded-t-lg transition-all"
                    title={`${formatMontant(v.montant)} HTG · ${v.count} vente(s)`}
                    style={{ height: `${hauteurPct}%`, background: 'linear-gradient(180deg, #16a34a, #059669)', minHeight: 4 }}
                  />
                  <span className="text-[11px] font-bold capitalize" style={{ color: 'var(--color-ink-3)' }}>{jour}</span>
                </div>
              );
            })}
            {!stats && <p className="text-sm" style={{ color: 'var(--color-ink-3)' }}>Chargement...</p>}
          </div>
        </div>

        <div className="card p-5 sm:p-6">
          <h3 className="text-sm font-bold tracking-wide mb-5" style={{ color: 'var(--color-ink)' }}>RÉPARTITION DU STOCK</h3>
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
                      {formatMontantCompact(r.valeur)}
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
      </div>

      {/* Top produits + Clients à risque */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 sm:gap-6">
        <div className="card p-5 sm:p-6">
          <h3 className="text-sm font-bold tracking-wide mb-5 flex items-center gap-2" style={{ color: 'var(--color-ink)' }}>
            <Trophy className="w-4 h-4" style={{ color: 'var(--color-warning)' }} />
            TOP PRODUITS · 7 DERNIERS JOURS
          </h3>
          <div className="space-y-3">
            {stats?.topProduits.map((p, i) => (
              <div key={p.produitId} className="flex items-center gap-3">
                <span
                  className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-extrabold shrink-0"
                  style={{ background: RANG_STYLE[i]?.bg ?? 'var(--color-line-2)', color: RANG_STYLE[i]?.fg ?? 'var(--color-ink-3)' }}
                >
                  {i + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-semibold truncate" style={{ color: 'var(--color-ink)' }}>{p.nom}</span>
                    <span className="text-sm font-bold shrink-0" style={{ color: 'var(--color-ink)' }}>{formatMontantCompact(p.montantVendu)}</span>
                  </div>
                  <div className="h-1.5 rounded-full overflow-hidden mt-1.5" style={{ background: 'var(--color-line-2)' }}>
                    <div className="h-full rounded-full" style={{ width: `${Math.max(4, (p.montantVendu / produitMax) * 100)}%`, background: 'linear-gradient(90deg, #f59e0b, #d97706)' }} />
                  </div>
                  <p className="text-xs mt-1" style={{ color: 'var(--color-ink-3)' }}>{p.quantiteVendue} {p.unite} vendu(e)s</p>
                </div>
              </div>
            ))}
            {(!stats || stats.topProduits.length === 0) && (
              <p className="text-sm" style={{ color: 'var(--color-ink-3)' }}>Aucune vente sur les 7 derniers jours.</p>
            )}
          </div>
        </div>

        <div className="card p-5 sm:p-6">
          <h3 className="text-sm font-bold tracking-wide mb-5 flex items-center gap-2" style={{ color: 'var(--color-ink)' }}>
            <Users className="w-4 h-4" style={{ color: 'var(--color-danger)' }} />
            CLIENTS À RISQUE · SOLDE DÛ
          </h3>
          <div className="space-y-1">
            {stats?.clientsRisque.map((c) => (
              <div key={c.id} className="flex items-center justify-between gap-2 py-2 border-b last:border-0" style={{ borderColor: 'var(--color-line-2)' }}>
                <div className="min-w-0">
                  <p className="text-sm font-semibold truncate" style={{ color: 'var(--color-ink)' }}>{c.nom}</p>
                  <span
                    className="inline-block text-[10px] font-bold px-1.5 py-0.5 rounded-full mt-0.5"
                    style={{
                      background: c.type === 'GROSSISTE' ? 'var(--color-primary-soft)' : 'var(--color-line-2)',
                      color: c.type === 'GROSSISTE' ? 'var(--color-primary-2)' : 'var(--color-ink-3)',
                    }}
                  >
                    {c.type === 'GROSSISTE' ? 'Grossiste' : 'Particulier'}
                  </span>
                </div>
                <span className="text-sm font-bold shrink-0" style={{ color: 'var(--color-danger)' }}>{formatMontantCompact(c.soldeDu)}</span>
              </div>
            ))}
            {(!stats || stats.clientsRisque.length === 0) && (
              <p className="text-sm" style={{ color: 'var(--color-ink-3)' }}>Aucun client à solde dû actuellement.</p>
            )}
          </div>
          {stats && stats.clientsRisque.length > 0 && (
            <Link href="/clients" className="inline-block text-xs font-bold mt-4" style={{ color: 'var(--color-primary-2)' }}>
              Voir tous les clients →
            </Link>
          )}
        </div>
      </div>

      {/* Commandes en attente + Mouvements récents */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 sm:gap-6">
        <div className="card p-5 sm:p-6">
          <h3 className="text-sm font-bold tracking-wide mb-5" style={{ color: 'var(--color-ink)' }}>COMMANDES FOURNISSEUR EN ATTENTE</h3>
          <div className="space-y-3">
            {stats?.commandesListe.map((c) => (
              <div key={c.id} className="flex items-center justify-between gap-2 py-2 border-b last:border-0" style={{ borderColor: 'var(--color-line-2)' }}>
                <div className="min-w-0">
                  <p className="text-sm font-semibold truncate" style={{ color: 'var(--color-ink)' }}>{c.numero} · {c.fournisseur.nom}</p>
                  <p className="text-xs" style={{ color: 'var(--color-ink-3)' }}>
                    {c.dateLivraisonPrevue
                      ? `Livraison prévue le ${new Date(c.dateLivraisonPrevue).toLocaleDateString('fr-FR')}`
                      : 'Livraison prévue non renseignée'}
                  </p>
                </div>
                {c.enRetard && (
                  <span className="text-[10px] font-bold px-2 py-1 rounded-full shrink-0" style={{ background: 'var(--color-danger-soft)', color: 'var(--color-danger)' }}>
                    En retard
                  </span>
                )}
              </div>
            ))}
            {(!stats || stats.commandesListe.length === 0) && (
              <p className="text-sm" style={{ color: 'var(--color-ink-3)' }}>Aucune commande en attente de réception.</p>
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

      {/* Actions rapides — modals premium (pas de window.confirm/alert) */}
      <Modal open={action === 'vente'} onClose={() => setAction(null)} title="Nouvelle vente" maxWidth={760}>
        <NouvelleVenteModal onDone={() => handleDone('Vente enregistrée avec succès.')} />
      </Modal>
      <Modal open={action === 'stock'} onClose={() => setAction(null)} title="Ajustement de stock" maxWidth={540}>
        <QuickAjustementModal onDone={() => handleDone('Stock ajusté avec succès.')} />
      </Modal>
      <Modal open={action === 'achat'} onClose={() => setAction(null)} title="Nouvelle commande fournisseur" maxWidth={760}>
        <NouvelleCommandeModal onDone={() => handleDone('Commande créée avec succès.')} />
      </Modal>
    </div>
  );
}
