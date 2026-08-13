'use client';
import { useEffect, useMemo, useState } from 'react';
import { RotateCcw, Trash2, Plus } from 'lucide-react';
import { api, apiErrorMessage } from '@/lib/api';
import { Retour, TypeRetour, Produit, Fournisseur, LotProduit } from '@/lib/types';
import PageToolbar from '@/components/ui/PageToolbar';
import EmptyState from '@/components/ui/EmptyState';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';

const TYPES: { value: TypeRetour; label: string; tone: 'success' | 'danger' | 'warning' | 'neutral' }[] = [
  { value: 'RETOUR_CLIENT', label: 'Retour client', tone: 'success' },
  { value: 'ERREUR_VENTE', label: 'Erreur de vente', tone: 'success' },
  { value: 'RETOUR_FOURNISSEUR', label: 'Retour fournisseur', tone: 'warning' },
  { value: 'PRODUIT_ENDOMMAGE', label: 'Produit endommagé', tone: 'danger' },
  { value: 'PRODUIT_EXPIRE', label: 'Produit expiré', tone: 'danger' },
];

const LABEL = Object.fromEntries(TYPES.map((t) => [t.value, t.label])) as Record<TypeRetour, string>;
const TONE = Object.fromEntries(TYPES.map((t) => [t.value, t.tone])) as Record<TypeRetour, 'success' | 'danger' | 'warning' | 'neutral'>;
const STOCK_POSITIF: TypeRetour[] = ['RETOUR_CLIENT', 'ERREUR_VENTE'];

interface LigneForm {
  produitId: string;
  lotId: string;
  quantite: string;
}

export default function RetoursPage() {
  const [retours, setRetours] = useState<Retour[]>([]);
  const [produits, setProduits] = useState<Produit[]>([]);
  const [lots, setLots] = useState<LotProduit[]>([]);
  const [fournisseurs, setFournisseurs] = useState<Fournisseur[]>([]);
  const [recherche, setRecherche] = useState('');
  const [chargement, setChargement] = useState(true);
  const [error, setError] = useState('');

  const [modalOuvert, setModalOuvert] = useState(false);
  const [type, setType] = useState<TypeRetour>('RETOUR_CLIENT');
  const [fournisseurId, setFournisseurId] = useState('');
  const [motif, setMotif] = useState('');
  const [lignes, setLignes] = useState<LigneForm[]>([{ produitId: '', lotId: '', quantite: '1' }]);
  const [enregistrement, setEnregistrement] = useState(false);

  async function charger() {
    setChargement(true);
    try {
      const [rRes, pRes, lRes, fRes] = await Promise.all([
        api.get('/retours', { params: { limit: 100 } }),
        api.get('/produits'),
        api.get('/stock/lots'),
        api.get('/fournisseurs'),
      ]);
      setRetours(rRes.data.data);
      setProduits(pRes.data.data);
      setLots(lRes.data.data);
      setFournisseurs(fRes.data.data);
    } catch (err) {
      setError(apiErrorMessage(err, 'Impossible de charger les retours'));
    } finally {
      setChargement(false);
    }
  }

  useEffect(() => {
    charger();
  }, []);

  const filtres = useMemo(
    () => retours.filter((r) => r.numero.toLowerCase().includes(recherche.toLowerCase()) || LABEL[r.type].toLowerCase().includes(recherche.toLowerCase())),
    [retours, recherche]
  );

  function ouvrirCreation() {
    setType('RETOUR_CLIENT');
    setFournisseurId('');
    setMotif('');
    setLignes([{ produitId: '', lotId: '', quantite: '1' }]);
    setError('');
    setModalOuvert(true);
  }

  function lotsDuProduit(produitId: string) {
    return lots.filter((l) => l.produitId === produitId);
  }

  async function enregistrer(e: React.FormEvent) {
    e.preventDefault();
    setEnregistrement(true);
    setError('');
    try {
      await api.post('/retours', {
        type,
        fournisseurId: type === 'RETOUR_FOURNISSEUR' ? fournisseurId : undefined,
        motif: motif || undefined,
        lignes: lignes.map((l) => ({ produitId: l.produitId, lotId: l.lotId, quantite: Number(l.quantite) })),
      });
      setModalOuvert(false);
      await charger();
    } catch (err) {
      setError(apiErrorMessage(err, "Impossible d'enregistrer le retour"));
    } finally {
      setEnregistrement(false);
    }
  }

  return (
    <div className="space-y-5">
      <PageToolbar search={recherche} onSearch={setRecherche} searchPlaceholder="N° ou type de retour..." actionLabel="Nouveau retour" onAction={ouvrirCreation} />

      {error && !modalOuvert && <div className="p-3 rounded-xl text-sm" style={{ background: 'var(--color-danger-soft)', color: 'var(--color-danger)' }}>{error}</div>}

      <div className="card overflow-hidden">
        {!chargement && filtres.length === 0 ? (
          <EmptyState icon={RotateCcw} title="Aucun retour" hint="Enregistrez un retour client, fournisseur ou une perte" />
        ) : (
          <div className="overflow-x-auto">
            <table className="table-shell w-full">
              <thead>
                <tr>
                  <th>N°</th>
                  <th>Type</th>
                  <th>Produits</th>
                  <th>Motif</th>
                  <th>Enregistré par</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {filtres.map((r) => (
                  <tr key={r.id}>
                    <td className="font-medium" style={{ color: 'var(--color-ink)' }}>{r.numero}</td>
                    <td><Badge tone={TONE[r.type]}>{LABEL[r.type]}</Badge></td>
                    <td>{r.lignes.map((l) => l.produit.nom).join(', ')}</td>
                    <td>{r.motif || '—'}</td>
                    <td>{r.utilisateur.prenom} {r.utilisateur.nom}</td>
                    <td>{new Date(r.createdAt).toLocaleDateString('fr-FR')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal open={modalOuvert} onClose={() => setModalOuvert(false)} title="Nouveau retour" maxWidth={640}>
        <form onSubmit={enregistrer} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium" style={{ color: 'var(--color-ink-2)' }}>Type de retour</label>
            <select className="input" value={type} onChange={(e) => setType(e.target.value as TypeRetour)}>
              {TYPES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
            <p className="text-xs" style={{ color: 'var(--color-ink-3)' }}>
              {STOCK_POSITIF.includes(type) ? 'Ce type remet du stock en rayon.' : 'Ce type retire du stock.'}
            </p>
          </div>

          {type === 'RETOUR_FOURNISSEUR' && (
            <div className="space-y-1.5">
              <label className="text-sm font-medium" style={{ color: 'var(--color-ink-2)' }}>Fournisseur</label>
              <select className="input" required value={fournisseurId} onChange={(e) => setFournisseurId(e.target.value)}>
                <option value="">Sélectionner...</option>
                {fournisseurs.map((f) => (
                  <option key={f.id} value={f.id}>{f.nom}</option>
                ))}
              </select>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium" style={{ color: 'var(--color-ink-2)' }}>Produits concernés</label>
            {lignes.map((l, i) => (
              <div key={i} className="flex gap-2 items-center">
                <select
                  className="input flex-1"
                  required
                  value={l.produitId}
                  onChange={(e) => setLignes((prev) => prev.map((pl, ii) => (ii === i ? { ...pl, produitId: e.target.value, lotId: '' } : pl)))}
                >
                  <option value="">Produit...</option>
                  {produits.map((p) => (
                    <option key={p.id} value={p.id}>{p.nom}{p.dosage ? ` — ${p.dosage}` : ''}</option>
                  ))}
                </select>
                <select
                  className="input w-40"
                  required
                  value={l.lotId}
                  onChange={(e) => setLignes((prev) => prev.map((pl, ii) => (ii === i ? { ...pl, lotId: e.target.value } : pl)))}
                >
                  <option value="">Lot...</option>
                  {lotsDuProduit(l.produitId).map((lot) => (
                    <option key={lot.id} value={lot.id}>{lot.numeroLot} ({lot.quantiteActuelle})</option>
                  ))}
                </select>
                <input type="number" min={1} className="input w-20" required placeholder="Qté" value={l.quantite} onChange={(e) => setLignes((prev) => prev.map((pl, ii) => (ii === i ? { ...pl, quantite: e.target.value } : pl)))} />
                {lignes.length > 1 && (
                  <button type="button" onClick={() => setLignes((prev) => prev.filter((_, ii) => ii !== i))} style={{ color: 'var(--color-danger)' }}>
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
            <button type="button" onClick={() => setLignes((prev) => [...prev, { produitId: '', lotId: '', quantite: '1' }])} className="text-xs font-semibold flex items-center gap-1" style={{ color: 'var(--color-primary-2)' }}>
              <Plus className="w-3.5 h-3.5" /> Ajouter une ligne
            </button>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium" style={{ color: 'var(--color-ink-2)' }}>Motif (optionnel)</label>
            <input className="input" value={motif} onChange={(e) => setMotif(e.target.value)} />
          </div>

          {error && <div className="p-3 rounded-xl text-sm" style={{ background: 'var(--color-danger-soft)', color: 'var(--color-danger)' }}>{error}</div>}

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" className="btn btn-secondary" onClick={() => setModalOuvert(false)}>Annuler</button>
            <button type="submit" disabled={enregistrement} className="btn btn-primary">{enregistrement ? 'Enregistrement...' : 'Enregistrer le retour'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
