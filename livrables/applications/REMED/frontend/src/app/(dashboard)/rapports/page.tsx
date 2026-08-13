'use client';
import { useEffect, useMemo, useState } from 'react';
import { Download, TrendingUp, Package, Truck, Wallet } from 'lucide-react';
import { api, apiErrorMessage } from '@/lib/api';
import { RapportVentes, RapportStock, RapportAchats, RapportFinance, PeriodePreset } from '@/lib/types';
import Badge from '@/components/ui/Badge';
import LineChart from '@/components/charts/LineChart';
import BarListChart from '@/components/charts/BarListChart';

type Onglet = 'ventes' | 'stock' | 'achats' | 'finance';

const ONGLETS: { value: Onglet; label: string; icon: typeof TrendingUp }[] = [
  { value: 'ventes', label: 'Ventes', icon: TrendingUp },
  { value: 'stock', label: 'Stock', icon: Package },
  { value: 'achats', label: 'Achats', icon: Truck },
  { value: 'finance', label: 'Finance', icon: Wallet },
];

const PERIODES: { value: PeriodePreset; label: string }[] = [
  { value: 'jour', label: "Aujourd'hui" },
  { value: 'semaine', label: '7 derniers jours' },
  { value: 'mois', label: 'Ce mois' },
  { value: 'annee', label: 'Cette année' },
];

const STATUT_TONE_STOCK: Record<string, 'success' | 'warning' | 'danger'> = { OK: 'success', BAS: 'warning', RUPTURE: 'danger' };

function formatHTG(v: number) {
  return new Intl.NumberFormat('fr-HT', { style: 'currency', currency: 'HTG', maximumFractionDigits: 0 }).format(v);
}

export default function RapportsPage() {
  const [onglet, setOnglet] = useState<Onglet>('ventes');
  const [periode, setPeriode] = useState<PeriodePreset>('mois');
  const [ventes, setVentes] = useState<RapportVentes | null>(null);
  const [stock, setStock] = useState<RapportStock | null>(null);
  const [achats, setAchats] = useState<RapportAchats | null>(null);
  const [finance, setFinance] = useState<RapportFinance | null>(null);
  const [chargement, setChargement] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function charger() {
      setChargement(true);
      setError('');
      try {
        if (onglet === 'ventes') setVentes((await api.get('/rapports/ventes', { params: { preset: periode } })).data.data);
        else if (onglet === 'stock') setStock((await api.get('/rapports/stock')).data.data);
        else if (onglet === 'achats') setAchats((await api.get('/rapports/achats', { params: { preset: periode } })).data.data);
        else if (onglet === 'finance') setFinance((await api.get('/rapports/finance', { params: { preset: periode } })).data.data);
      } catch (err) {
        setError(apiErrorMessage(err, 'Impossible de charger le rapport'));
      } finally {
        setChargement(false);
      }
    }
    charger();
  }, [onglet, periode]);

  const serieCAFormatee = useMemo(
    () => (ventes?.parJour || []).map((p) => ({ label: new Date(p.date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }), value: p.valeur })),
    [ventes]
  );
  const topProduitsFormates = useMemo(() => (ventes?.parProduit || []).slice(0, 8).map((p) => ({ label: p.nom, value: p.quantite })), [ventes]);

  function telechargerCsv(url: string, nomFichier: string) {
    api
      .get(url, { params: onglet === 'stock' ? undefined : { preset: periode }, responseType: 'blob' })
      .then((res) => {
        const lien = document.createElement('a');
        lien.href = URL.createObjectURL(res.data);
        lien.download = nomFichier;
        lien.click();
        URL.revokeObjectURL(lien.href);
      })
      .catch((err) => setError(apiErrorMessage(err, "Impossible d'exporter le rapport")));
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex gap-1.5 p-1 rounded-xl" style={{ background: 'var(--color-surface-2)' }}>
          {ONGLETS.map((o) => {
            const Icon = o.icon;
            return (
              <button
                key={o.value}
                onClick={() => setOnglet(o.value)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5"
                style={onglet === o.value ? { background: 'var(--color-surface)', color: 'var(--color-primary-2)', boxShadow: 'var(--shadow-sm)' } : { color: 'var(--color-ink-3)' }}
              >
                <Icon className="w-3.5 h-3.5" /> {o.label}
              </button>
            );
          })}
        </div>

        {onglet !== 'stock' && (
          <select className="input w-auto" value={periode} onChange={(e) => setPeriode(e.target.value as PeriodePreset)}>
            {PERIODES.map((p) => (
              <option key={p.value} value={p.value}>{p.label}</option>
            ))}
          </select>
        )}
      </div>

      {error && <div className="p-3 rounded-xl text-sm" style={{ background: 'var(--color-danger-soft)', color: 'var(--color-danger)' }}>{error}</div>}

      {onglet === 'ventes' && (
        <div className="space-y-5">
          <div className="flex justify-end">
            <button className="btn btn-secondary" onClick={() => telechargerCsv('/rapports/ventes/export.csv', 'rapport-ventes.csv')}>
              <Download className="w-4 h-4" /> Exporter CSV
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="card p-4">
              <p className="text-xs font-semibold" style={{ color: 'var(--color-ink-3)' }}>Chiffre d&apos;affaires</p>
              <p className="text-2xl font-bold" style={{ color: 'var(--color-ink)' }}>{ventes ? formatHTG(ventes.totalCA) : '—'}</p>
            </div>
            <div className="card p-4">
              <p className="text-xs font-semibold" style={{ color: 'var(--color-ink-3)' }}>Nombre de ventes</p>
              <p className="text-2xl font-bold" style={{ color: 'var(--color-ink)' }}>{ventes?.totalVentes ?? '—'}</p>
            </div>
          </div>
          <div className="card p-5 sm:p-6">
            <h3 className="text-sm font-bold mb-4" style={{ color: 'var(--color-ink)' }}>Évolution</h3>
            <LineChart data={serieCAFormatee} />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="card p-5 sm:p-6">
              <h3 className="text-sm font-bold mb-4" style={{ color: 'var(--color-ink)' }}>Produits les plus vendus</h3>
              <BarListChart data={topProduitsFormates} formatValue={(v) => `${v} u.`} />
            </div>
            <div className="card overflow-hidden">
              <div className="p-4 border-b" style={{ borderColor: 'var(--color-line-2)' }}>
                <h3 className="text-sm font-bold" style={{ color: 'var(--color-ink)' }}>Par caissier</h3>
              </div>
              <table className="table-shell w-full">
                <thead><tr><th>Caissier</th><th>Ventes</th><th>CA</th></tr></thead>
                <tbody>
                  {(ventes?.parCaissier || []).map((c) => (
                    <tr key={c.nom}><td>{c.nom}</td><td>{c.nombreVentes}</td><td className="font-semibold">{formatHTG(c.ca)}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {onglet === 'stock' && stock && (
        <div className="space-y-5">
          <div className="flex justify-end">
            <button className="btn btn-secondary" onClick={() => telechargerCsv('/rapports/stock/export.csv', 'rapport-stock.csv')}>
              <Download className="w-4 h-4" /> Exporter CSV
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="card p-4">
              <p className="text-xs font-semibold" style={{ color: 'var(--color-ink-3)' }}>Valeur totale du stock</p>
              <p className="text-2xl font-bold" style={{ color: 'var(--color-ink)' }}>{formatHTG(stock.valeurTotale)}</p>
            </div>
            <div className="card p-4">
              <p className="text-xs font-semibold" style={{ color: 'var(--color-ink-3)' }}>Ruptures</p>
              <p className="text-2xl font-bold" style={{ color: 'var(--color-danger)' }}>{stock.ruptures}</p>
            </div>
            <div className="card p-4">
              <p className="text-xs font-semibold" style={{ color: 'var(--color-ink-3)' }}>Stock bas</p>
              <p className="text-2xl font-bold" style={{ color: 'var(--color-warning)' }}>{stock.stockBas}</p>
            </div>
          </div>
          <div className="card overflow-hidden">
            <table className="table-shell w-full">
              <thead><tr><th>Produit</th><th>Quantité</th><th>Seuil</th><th>Valeur</th><th>Statut</th></tr></thead>
              <tbody>
                {stock.lignes.map((l) => (
                  <tr key={l.nom}>
                    <td>{l.nom}</td><td>{l.quantiteTotal}</td><td>{l.seuilAlerte}</td><td>{formatHTG(l.valeur)}</td>
                    <td><Badge tone={STATUT_TONE_STOCK[l.statut]}>{l.statut}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {onglet === 'achats' && achats && (
        <div className="space-y-5">
          <div className="flex justify-end">
            <button className="btn btn-secondary" onClick={() => telechargerCsv('/rapports/achats/export.csv', 'rapport-achats.csv')}>
              <Download className="w-4 h-4" /> Exporter CSV
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="card p-4"><p className="text-xs font-semibold" style={{ color: 'var(--color-ink-3)' }}>Montant commandé</p><p className="text-2xl font-bold" style={{ color: 'var(--color-ink)' }}>{formatHTG(achats.montantTotalCommande)}</p></div>
            <div className="card p-4"><p className="text-xs font-semibold" style={{ color: 'var(--color-ink-3)' }}>Montant reçu</p><p className="text-2xl font-bold" style={{ color: 'var(--color-ink)' }}>{formatHTG(achats.montantTotalRecu)}</p></div>
            <div className="card p-4"><p className="text-xs font-semibold" style={{ color: 'var(--color-ink-3)' }}>Commandes</p><p className="text-2xl font-bold" style={{ color: 'var(--color-ink)' }}>{achats.nombreCommandes}</p></div>
          </div>
          <div className="card overflow-hidden">
            <table className="table-shell w-full">
              <thead><tr><th>Fournisseur</th><th>Commandes</th><th>Commandé</th><th>Reçu</th></tr></thead>
              <tbody>
                {achats.parFournisseur.map((f) => (
                  <tr key={f.nom}><td>{f.nom}</td><td>{f.nombreCommandes}</td><td>{formatHTG(f.montantCommande)}</td><td>{formatHTG(f.montantRecu)}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {onglet === 'finance' && finance && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="card p-4"><p className="text-xs font-semibold" style={{ color: 'var(--color-ink-3)' }}>CA</p><p className="text-2xl font-bold" style={{ color: 'var(--color-ink)' }}>{formatHTG(finance.ca)}</p></div>
            <div className="card p-4"><p className="text-xs font-semibold" style={{ color: 'var(--color-ink-3)' }}>Dépenses</p><p className="text-2xl font-bold" style={{ color: 'var(--color-ink)' }}>{formatHTG(finance.depensesTotal)}</p></div>
            <div className="card p-4"><p className="text-xs font-semibold" style={{ color: 'var(--color-ink-3)' }}>Bénéfice estimé</p><p className="text-2xl font-bold" style={{ color: 'var(--color-primary-2)' }}>{formatHTG(finance.beneficeEstime)}</p></div>
          </div>
          <div className="card overflow-hidden">
            <div className="p-4 border-b" style={{ borderColor: 'var(--color-line-2)' }}>
              <h3 className="text-sm font-bold" style={{ color: 'var(--color-ink)' }}>Sessions de caisse</h3>
            </div>
            <table className="table-shell w-full">
              <thead><tr><th>Ouverte par</th><th>Ouverture</th><th>Statut</th><th>Écart</th></tr></thead>
              <tbody>
                {finance.caisseSessions.map((s, i) => (
                  <tr key={i}>
                    <td>{s.ouvertePar}</td>
                    <td>{new Date(s.ouverteLe).toLocaleString('fr-FR')}</td>
                    <td><Badge tone={s.statut === 'OUVERTE' ? 'info' : 'neutral'}>{s.statut}</Badge></td>
                    <td>{s.ecart !== null && s.ecart !== undefined ? formatHTG(s.ecart) : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {chargement && <p className="text-sm" style={{ color: 'var(--color-ink-3)' }}>Chargement...</p>}
    </div>
  );
}
