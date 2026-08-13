'use client';
import { useEffect, useMemo, useState } from 'react';
import { Pill, Wallet, AlertTriangle, CalendarClock, Truck, TrendingUp, ShoppingCart, PackageX, Receipt } from 'lucide-react';
import { api, apiErrorMessage } from '@/lib/api';
import { DashboardStats, StatsPeriode, PeriodePreset } from '@/lib/types';
import StatCard from '@/components/ui/StatCard';
import EmptyState from '@/components/ui/EmptyState';
import Badge from '@/components/ui/Badge';
import LineChart from '@/components/charts/LineChart';
import BarListChart from '@/components/charts/BarListChart';
import ProportionBar from '@/components/charts/ProportionBar';

interface StockBasItem {
  id: string;
  nom: string;
  dosage: string | null;
  quantiteTotal: number;
  seuilAlerte: number;
}

interface PeremptionItem {
  id: string;
  numeroLot: string;
  dateExpiration: string;
  quantiteActuelle: number;
  expire: boolean;
  produit: { nom: string; dosage: string | null };
}

const PERIODES: { value: PeriodePreset; label: string }[] = [
  { value: 'jour', label: "Aujourd'hui" },
  { value: 'semaine', label: '7 derniers jours' },
  { value: 'mois', label: 'Ce mois' },
  { value: 'annee', label: 'Cette année' },
];

const LABEL_CATEGORIE: Record<string, string> = {
  LOYER: 'Loyer',
  ELECTRICITE: 'Électricité',
  INTERNET: 'Internet',
  TRANSPORT: 'Transport',
  SALAIRES: 'Salaires',
  FOURNITURES: 'Fournitures',
  MAINTENANCE: 'Maintenance',
  AUTRES: 'Autres',
};

function formatHTG(v: number) {
  return new Intl.NumberFormat('fr-HT', { style: 'currency', currency: 'HTG', maximumFractionDigits: 0 }).format(v);
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [statsPeriode, setStatsPeriode] = useState<StatsPeriode | null>(null);
  const [periode, setPeriode] = useState<PeriodePreset>('mois');
  const [stockBas, setStockBas] = useState<StockBasItem[]>([]);
  const [peremption, setPeremption] = useState<PeremptionItem[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const [statsRes, stockBasRes, peremptionRes] = await Promise.all([
          api.get('/dashboard/stats'),
          api.get('/stock/alertes/stock-bas'),
          api.get('/stock/alertes/peremption', { params: { joursSeuil: 90 } }),
        ]);
        setStats(statsRes.data.data);
        setStockBas(stockBasRes.data.data);
        setPeremption(peremptionRes.data.data);
      } catch (err) {
        setError(apiErrorMessage(err, 'Impossible de charger le tableau de bord'));
      }
    }
    load();
  }, []);

  useEffect(() => {
    async function loadPeriode() {
      try {
        const { data } = await api.get('/dashboard/stats-periode', { params: { preset: periode } });
        setStatsPeriode(data.data);
      } catch (err) {
        setError(apiErrorMessage(err, 'Impossible de charger les statistiques de la période'));
      }
    }
    loadPeriode();
  }, [periode]);

  const serieCAFormatee = useMemo(
    () =>
      (statsPeriode?.serieCA || []).map((p) => ({
        label: new Date(p.date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }),
        value: p.valeur,
      })),
    [statsPeriode]
  );

  const topProduitsFormates = useMemo(
    () => (statsPeriode?.topProduits || []).map((p) => ({ label: p.nom, value: p.quantite })),
    [statsPeriode]
  );

  const depensesSegments = useMemo(
    () => (statsPeriode?.depensesParCategorie || []).map((d) => ({ label: LABEL_CATEGORIE[d.categorie] || d.categorie, value: d.montant })),
    [statsPeriode]
  );

  if (error) {
    return <div className="p-4 rounded-xl text-sm" style={{ background: 'var(--color-danger-soft)', color: 'var(--color-danger)' }}>{error}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Pill} theme="brand" label="PRODUITS ACTIFS" value={stats ? String(stats.totalProduits) : '—'} />
        <StatCard icon={Wallet} theme="blue" label="VALEUR DU STOCK" value={stats ? formatHTG(stats.valeurStock) : '—'} sub="au prix d'achat" />
        <StatCard icon={AlertTriangle} theme="amber" label="STOCK BAS" value={stats ? String(stats.produitsEnAlerte) : '—'} sub="produits sous le seuil" />
        <StatCard icon={CalendarClock} theme="rose" label="PÉREMPTION < 90J" value={stats ? String(stats.lotsPerimesBientot) : '—'} sub="lots concernés" />
      </div>

      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-sm font-bold" style={{ color: 'var(--color-ink)' }}>Activité</h2>
        <div className="flex gap-1.5 p-1 rounded-xl" style={{ background: 'var(--color-surface-2)' }}>
          {PERIODES.map((p) => (
            <button
              key={p.value}
              onClick={() => setPeriode(p.value)}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"
              style={periode === p.value ? { background: 'var(--color-surface)', color: 'var(--color-primary-2)', boxShadow: 'var(--shadow-sm)' } : { color: 'var(--color-ink-3)' }}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={ShoppingCart} theme="brand" label="CHIFFRE D'AFFAIRES" value={statsPeriode ? formatHTG(statsPeriode.ca) : '—'} sub={statsPeriode ? `${statsPeriode.nombreVentes} vente(s)` : undefined} />
        <StatCard icon={TrendingUp} theme="blue" label="BÉNÉFICE ESTIMÉ" value={statsPeriode ? formatHTG(statsPeriode.beneficeEstime) : '—'} sub="CA − coût marchandise" />
        <StatCard icon={Receipt} theme="amber" label="DÉPENSES" value={statsPeriode ? formatHTG(statsPeriode.depensesTotal) : '—'} />
        <StatCard icon={PackageX} theme="rose" label="RUPTURES DE STOCK" value={statsPeriode ? String(statsPeriode.ruptures) : '—'} sub="produits à 0" />
      </div>

      <div className="card p-5 sm:p-6">
        <h3 className="text-sm font-bold mb-4" style={{ color: 'var(--color-ink)' }}>Évolution du chiffre d&apos;affaires</h3>
        <LineChart data={serieCAFormatee} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-5 sm:p-6">
          <h3 className="text-sm font-bold mb-4" style={{ color: 'var(--color-ink)' }}>Produits les plus vendus</h3>
          <BarListChart data={topProduitsFormates} formatValue={(v) => `${v} u.`} />
        </div>

        <div className="card p-5 sm:p-6">
          <h3 className="text-sm font-bold mb-4" style={{ color: 'var(--color-ink)' }}>Dépenses par catégorie</h3>
          <ProportionBar segments={depensesSegments} formatValue={formatHTG} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-5 sm:p-6">
          <h3 className="text-sm font-bold mb-4" style={{ color: 'var(--color-ink)' }}>Stock bas</h3>
          {stockBas.length === 0 ? (
            <EmptyState icon={Pill} title="Aucune alerte de stock" hint="Tous les produits sont au-dessus de leur seuil" />
          ) : (
            <div className="space-y-2">
              {stockBas.map((p) => (
                <div key={p.id} className="flex items-center justify-between py-2 border-b last:border-0" style={{ borderColor: 'var(--color-line-2)' }}>
                  <div>
                    <p className="text-sm font-semibold" style={{ color: 'var(--color-ink)' }}>{p.nom}{p.dosage ? ` — ${p.dosage}` : ''}</p>
                    <p className="text-xs" style={{ color: 'var(--color-ink-3)' }}>Seuil : {p.seuilAlerte}</p>
                  </div>
                  <Badge tone="warning">{p.quantiteTotal} en stock</Badge>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card p-5 sm:p-6">
          <h3 className="text-sm font-bold mb-4" style={{ color: 'var(--color-ink)' }}>Péremption proche (90 jours)</h3>
          {peremption.length === 0 ? (
            <EmptyState icon={CalendarClock} title="Aucun lot proche de la péremption" />
          ) : (
            <div className="space-y-2">
              {peremption.map((lot) => (
                <div key={lot.id} className="flex items-center justify-between py-2 border-b last:border-0" style={{ borderColor: 'var(--color-line-2)' }}>
                  <div>
                    <p className="text-sm font-semibold" style={{ color: 'var(--color-ink)' }}>{lot.produit.nom} — Lot {lot.numeroLot}</p>
                    <p className="text-xs" style={{ color: 'var(--color-ink-3)' }}>
                      {new Date(lot.dateExpiration).toLocaleDateString('fr-FR')} · {lot.quantiteActuelle} unités
                    </p>
                  </div>
                  <Badge tone={lot.expire ? 'danger' : 'warning'}>{lot.expire ? 'Expiré' : 'Bientôt'}</Badge>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {stats && (
        <div className="card p-5 sm:p-6 flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl flex items-center justify-center text-white" style={{ background: 'var(--gradient-blue)' }}>
            <Truck className="w-5 h-5" />
          </div>
          <div>
            <p className="text-sm font-semibold" style={{ color: 'var(--color-ink)' }}>{stats.totalFournisseurs} fournisseur(s) actif(s)</p>
            <p className="text-xs" style={{ color: 'var(--color-ink-3)' }}>{stats.ventesAujourdhui ?? 0} vente(s) aujourd&apos;hui</p>
          </div>
        </div>
      )}
    </div>
  );
}
