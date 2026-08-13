'use client';
import { useEffect, useMemo, useState } from 'react';
import { Pill, AlertTriangle } from 'lucide-react';
import { api, apiErrorMessage } from '@/lib/api';
import { Produit, Categorie, FormePharmaceutique } from '@/lib/types';
import PageToolbar from '@/components/ui/PageToolbar';
import EmptyState from '@/components/ui/EmptyState';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import { useAuthStore } from '@/store/authStore';

const FORMES: { value: FormePharmaceutique; label: string }[] = [
  { value: 'COMPRIME', label: 'Comprimé' },
  { value: 'GELULE', label: 'Gélule' },
  { value: 'SIROP', label: 'Sirop' },
  { value: 'INJECTABLE', label: 'Injectable' },
  { value: 'POMMADE_CREME', label: 'Pommade / Crème' },
  { value: 'SUPPOSITOIRE', label: 'Suppositoire' },
  { value: 'SACHET', label: 'Sachet' },
  { value: 'GOUTTE', label: 'Goutte' },
  { value: 'SOLUTE', label: 'Soluté' },
  { value: 'AUTRE', label: 'Autre' },
];

const CAN_EDIT_CATALOGUE = ['SUPER_ADMIN', 'GERANT', 'PHARMACIEN'];

const emptyForm = {
  nom: '',
  dci: '',
  dosage: '',
  formePharmaceutique: 'COMPRIME' as FormePharmaceutique,
  codeBarres: '',
  categorieId: '',
  prixAchat: '',
  prixVente: '',
  seuilAlerte: '10',
  necessiteOrdonnance: false,
  substanceControlee: false,
};

function formatHTG(v: string | number) {
  return new Intl.NumberFormat('fr-HT', { style: 'currency', currency: 'HTG', maximumFractionDigits: 2 }).format(Number(v));
}

export default function ProduitsPage() {
  const { utilisateur } = useAuthStore();
  const peutGerer = utilisateur ? CAN_EDIT_CATALOGUE.includes(utilisateur.role) : false;

  const [produits, setProduits] = useState<Produit[]>([]);
  const [categories, setCategories] = useState<Categorie[]>([]);
  const [recherche, setRecherche] = useState('');
  const [chargement, setChargement] = useState(true);
  const [error, setError] = useState('');
  const [modalOuvert, setModalOuvert] = useState(false);
  const [produitEdite, setProduitEdite] = useState<Produit | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [enregistrement, setEnregistrement] = useState(false);

  async function charger() {
    setChargement(true);
    try {
      const [produitsRes, categoriesRes] = await Promise.all([
        api.get('/produits', { params: recherche ? { recherche } : undefined }),
        api.get('/categories'),
      ]);
      setProduits(produitsRes.data.data);
      setCategories(categoriesRes.data.data);
    } catch (err) {
      setError(apiErrorMessage(err, 'Impossible de charger les produits'));
    } finally {
      setChargement(false);
    }
  }

  useEffect(() => {
    const t = setTimeout(charger, 250);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recherche]);

  function ouvrirCreation() {
    setProduitEdite(null);
    setForm(emptyForm);
    setModalOuvert(true);
  }

  function ouvrirEdition(p: Produit) {
    setProduitEdite(p);
    setForm({
      nom: p.nom,
      dci: p.dci || '',
      dosage: p.dosage || '',
      formePharmaceutique: p.formePharmaceutique,
      codeBarres: p.codeBarres || '',
      categorieId: p.categorieId || '',
      prixAchat: p.prixAchat,
      prixVente: p.prixVente,
      seuilAlerte: String(p.seuilAlerte),
      necessiteOrdonnance: p.necessiteOrdonnance,
      substanceControlee: p.substanceControlee,
    });
    setModalOuvert(true);
  }

  async function enregistrer(e: React.FormEvent) {
    e.preventDefault();
    setEnregistrement(true);
    setError('');
    try {
      const payload = { ...form, categorieId: form.categorieId || undefined };
      if (produitEdite) {
        await api.patch(`/produits/${produitEdite.id}`, payload);
      } else {
        await api.post('/produits', payload);
      }
      setModalOuvert(false);
      await charger();
    } catch (err) {
      setError(apiErrorMessage(err, "Impossible d'enregistrer le produit"));
    } finally {
      setEnregistrement(false);
    }
  }

  const listeVide = useMemo(() => !chargement && produits.length === 0, [chargement, produits]);

  return (
    <div className="space-y-5">
      <PageToolbar
        search={recherche}
        onSearch={setRecherche}
        searchPlaceholder="Nom, DCI, code-barres..."
        actionLabel={peutGerer ? 'Nouveau produit' : undefined}
        onAction={peutGerer ? ouvrirCreation : undefined}
      />

      {error && (
        <div className="p-3 rounded-xl text-sm" style={{ background: 'var(--color-danger-soft)', color: 'var(--color-danger)' }}>
          {error}
        </div>
      )}

      <div className="card overflow-hidden">
        {listeVide ? (
          <EmptyState icon={Pill} title="Aucun produit" hint="Ajoutez votre premier produit au catalogue" />
        ) : (
          <div className="overflow-x-auto">
            <table className="table-shell w-full">
              <thead>
                <tr>
                  <th>Produit</th>
                  <th>Catégorie</th>
                  <th>Forme</th>
                  <th>Prix vente</th>
                  <th>Stock</th>
                  <th>Statut</th>
                </tr>
              </thead>
              <tbody>
                {produits.map((p) => (
                  <tr key={p.id} className={peutGerer ? 'cursor-pointer' : ''} onClick={() => peutGerer && ouvrirEdition(p)}>
                    <td>
                      <div className="font-semibold" style={{ color: 'var(--color-ink)' }}>{p.nom}</div>
                      <div className="text-xs" style={{ color: 'var(--color-ink-3)' }}>
                        {p.dci ? `${p.dci} · ` : ''}{p.dosage || ''}
                      </div>
                    </td>
                    <td>{p.categorie?.nom || '—'}</td>
                    <td>{FORMES.find((f) => f.value === p.formePharmaceutique)?.label}</td>
                    <td>{formatHTG(p.prixVente)}</td>
                    <td>
                      <span className="flex items-center gap-1.5">
                        {p.quantiteTotal}
                        {p.quantiteTotal <= p.seuilAlerte && <AlertTriangle className="w-3.5 h-3.5" style={{ color: 'var(--color-warning)' }} />}
                      </span>
                    </td>
                    <td>
                      <div className="flex flex-wrap gap-1.5">
                        {p.necessiteOrdonnance && <Badge tone="info">Ordonnance</Badge>}
                        {p.substanceControlee && <Badge tone="violet">Contrôlée</Badge>}
                        {!p.actif && <Badge tone="neutral">Inactif</Badge>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal open={modalOuvert} onClose={() => setModalOuvert(false)} title={produitEdite ? 'Modifier le produit' : 'Nouveau produit'} maxWidth={640}>
        <form onSubmit={enregistrer} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-sm font-medium" style={{ color: 'var(--color-ink-2)' }}>Nom</label>
              <input className="input" required value={form.nom} onChange={(e) => setForm({ ...form, nom: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium" style={{ color: 'var(--color-ink-2)' }}>DCI (molécule)</label>
              <input className="input" value={form.dci} onChange={(e) => setForm({ ...form, dci: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium" style={{ color: 'var(--color-ink-2)' }}>Dosage</label>
              <input className="input" placeholder="500mg" value={form.dosage} onChange={(e) => setForm({ ...form, dosage: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium" style={{ color: 'var(--color-ink-2)' }}>Forme pharmaceutique</label>
              <select className="input" value={form.formePharmaceutique} onChange={(e) => setForm({ ...form, formePharmaceutique: e.target.value as FormePharmaceutique })}>
                {FORMES.map((f) => (
                  <option key={f.value} value={f.value}>{f.label}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium" style={{ color: 'var(--color-ink-2)' }}>Catégorie</label>
              <select className="input" value={form.categorieId} onChange={(e) => setForm({ ...form, categorieId: e.target.value })}>
                <option value="">Aucune</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.nom}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium" style={{ color: 'var(--color-ink-2)' }}>Code-barres</label>
              <input className="input" value={form.codeBarres} onChange={(e) => setForm({ ...form, codeBarres: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium" style={{ color: 'var(--color-ink-2)' }}>Seuil d&apos;alerte</label>
              <input type="number" min={0} className="input" value={form.seuilAlerte} onChange={(e) => setForm({ ...form, seuilAlerte: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium" style={{ color: 'var(--color-ink-2)' }}>Prix d&apos;achat (HTG)</label>
              <input type="number" min={0} step="0.01" required className="input" value={form.prixAchat} onChange={(e) => setForm({ ...form, prixAchat: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium" style={{ color: 'var(--color-ink-2)' }}>Prix de vente (HTG)</label>
              <input type="number" min={0} step="0.01" required className="input" value={form.prixVente} onChange={(e) => setForm({ ...form, prixVente: e.target.value })} />
            </div>
          </div>

          <div className="flex flex-col gap-2 pt-1">
            <label className="flex items-center gap-2 text-sm" style={{ color: 'var(--color-ink-2)' }}>
              <input type="checkbox" checked={form.necessiteOrdonnance} onChange={(e) => setForm({ ...form, necessiteOrdonnance: e.target.checked })} />
              Nécessite une ordonnance médicale
            </label>
            <label className="flex items-center gap-2 text-sm" style={{ color: 'var(--color-ink-2)' }}>
              <input type="checkbox" checked={form.substanceControlee} onChange={(e) => setForm({ ...form, substanceControlee: e.target.checked })} />
              Substance contrôlée
            </label>
          </div>

          {error && (
            <div className="p-3 rounded-xl text-sm" style={{ background: 'var(--color-danger-soft)', color: 'var(--color-danger)' }}>
              {error}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" className="btn btn-secondary" onClick={() => setModalOuvert(false)}>Annuler</button>
            <button type="submit" disabled={enregistrement} className="btn btn-primary">
              {enregistrement ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
