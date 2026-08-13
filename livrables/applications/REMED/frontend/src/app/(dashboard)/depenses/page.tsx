'use client';
import { useEffect, useMemo, useState } from 'react';
import { Wallet2 } from 'lucide-react';
import { api, apiErrorMessage } from '@/lib/api';
import { Depense, CategorieDepense, ModePaiement } from '@/lib/types';
import PageToolbar from '@/components/ui/PageToolbar';
import EmptyState from '@/components/ui/EmptyState';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';

const CATEGORIES: { value: CategorieDepense; label: string }[] = [
  { value: 'LOYER', label: 'Loyer' },
  { value: 'ELECTRICITE', label: 'Électricité' },
  { value: 'INTERNET', label: 'Internet' },
  { value: 'TRANSPORT', label: 'Transport' },
  { value: 'SALAIRES', label: 'Salaires' },
  { value: 'FOURNITURES', label: 'Fournitures' },
  { value: 'MAINTENANCE', label: 'Maintenance' },
  { value: 'AUTRES', label: 'Autres' },
];

const MODES: { value: ModePaiement; label: string }[] = [
  { value: 'ESPECES', label: 'Espèces' },
  { value: 'CARTE', label: 'Carte' },
  { value: 'MOBILE_MONEY', label: 'Mobile Money' },
  { value: 'VIREMENT', label: 'Virement' },
  { value: 'CHEQUE', label: 'Chèque' },
  { value: 'AUTRE', label: 'Autre' },
];

const LABEL_CATEGORIE = Object.fromEntries(CATEGORIES.map((c) => [c.value, c.label])) as Record<CategorieDepense, string>;

function formatHTG(v: string | number) {
  return new Intl.NumberFormat('fr-HT', { style: 'currency', currency: 'HTG', maximumFractionDigits: 2 }).format(Number(v));
}

const formVide = { categorie: 'AUTRES' as CategorieDepense, montant: '', description: '', modePaiement: 'ESPECES' as ModePaiement };

export default function DepensesPage() {
  const [depenses, setDepenses] = useState<Depense[]>([]);
  const [recherche, setRecherche] = useState('');
  const [chargement, setChargement] = useState(true);
  const [error, setError] = useState('');
  const [modalOuvert, setModalOuvert] = useState(false);
  const [form, setForm] = useState(formVide);
  const [enregistrement, setEnregistrement] = useState(false);

  async function charger() {
    setChargement(true);
    try {
      const { data } = await api.get('/depenses', { params: { limit: 100 } });
      setDepenses(data.data);
    } catch (err) {
      setError(apiErrorMessage(err, 'Impossible de charger les dépenses'));
    } finally {
      setChargement(false);
    }
  }

  useEffect(() => {
    charger();
  }, []);

  const filtres = useMemo(
    () => depenses.filter((d) => LABEL_CATEGORIE[d.categorie].toLowerCase().includes(recherche.toLowerCase()) || (d.description || '').toLowerCase().includes(recherche.toLowerCase())),
    [depenses, recherche]
  );

  const totalPeriode = useMemo(() => filtres.reduce((s, d) => s + Number(d.montant), 0), [filtres]);

  function ouvrirCreation() {
    setForm(formVide);
    setError('');
    setModalOuvert(true);
  }

  async function enregistrer(e: React.FormEvent) {
    e.preventDefault();
    setEnregistrement(true);
    setError('');
    try {
      await api.post('/depenses', { ...form, montant: Number(form.montant) });
      setModalOuvert(false);
      await charger();
    } catch (err) {
      setError(apiErrorMessage(err, "Impossible d'enregistrer la dépense"));
    } finally {
      setEnregistrement(false);
    }
  }

  return (
    <div className="space-y-5">
      <PageToolbar search={recherche} onSearch={setRecherche} searchPlaceholder="Catégorie ou description..." actionLabel="Nouvelle dépense" onAction={ouvrirCreation} />

      {error && !modalOuvert && <div className="p-3 rounded-xl text-sm" style={{ background: 'var(--color-danger-soft)', color: 'var(--color-danger)' }}>{error}</div>}

      <div className="card p-4">
        <p className="text-xs font-semibold" style={{ color: 'var(--color-ink-3)' }}>Total affiché</p>
        <p className="text-2xl font-bold" style={{ color: 'var(--color-ink)' }}>{formatHTG(totalPeriode)}</p>
      </div>

      <div className="card overflow-hidden">
        {!chargement && filtres.length === 0 ? (
          <EmptyState icon={Wallet2} title="Aucune dépense" hint="Enregistrez votre première dépense" />
        ) : (
          <div className="overflow-x-auto">
            <table className="table-shell w-full">
              <thead>
                <tr>
                  <th>Catégorie</th>
                  <th>Description</th>
                  <th>Mode</th>
                  <th>Montant</th>
                  <th>Enregistré par</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {filtres.map((d) => (
                  <tr key={d.id}>
                    <td><Badge tone="neutral">{LABEL_CATEGORIE[d.categorie]}</Badge></td>
                    <td>{d.description || '—'}</td>
                    <td>{MODES.find((m) => m.value === d.modePaiement)?.label || d.modePaiement}</td>
                    <td className="font-semibold">{formatHTG(d.montant)}</td>
                    <td>{d.utilisateur.prenom} {d.utilisateur.nom}</td>
                    <td>{new Date(d.createdAt).toLocaleDateString('fr-FR')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal open={modalOuvert} onClose={() => setModalOuvert(false)} title="Nouvelle dépense" maxWidth={480}>
        <form onSubmit={enregistrer} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium" style={{ color: 'var(--color-ink-2)' }}>Catégorie</label>
            <select className="input" value={form.categorie} onChange={(e) => setForm({ ...form, categorie: e.target.value as CategorieDepense })}>
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium" style={{ color: 'var(--color-ink-2)' }}>Montant (HTG)</label>
            <input type="number" min={0} step="0.01" required className="input" value={form.montant} onChange={(e) => setForm({ ...form, montant: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium" style={{ color: 'var(--color-ink-2)' }}>Description (optionnel)</label>
            <input className="input" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium" style={{ color: 'var(--color-ink-2)' }}>Mode de paiement</label>
            <select className="input" value={form.modePaiement} onChange={(e) => setForm({ ...form, modePaiement: e.target.value as ModePaiement })}>
              {MODES.map((m) => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
            {form.modePaiement === 'ESPECES' && (
              <p className="text-xs" style={{ color: 'var(--color-ink-3)' }}>Une dépense en espèces exige une caisse ouverte : elle sera automatiquement déduite du tiroir.</p>
            )}
          </div>

          {error && <div className="p-3 rounded-xl text-sm" style={{ background: 'var(--color-danger-soft)', color: 'var(--color-danger)' }}>{error}</div>}

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" className="btn btn-secondary" onClick={() => setModalOuvert(false)}>Annuler</button>
            <button type="submit" disabled={enregistrement} className="btn btn-primary">{enregistrement ? 'Enregistrement...' : 'Enregistrer'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
