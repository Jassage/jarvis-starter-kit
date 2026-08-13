'use client';
import { useEffect, useState } from 'react';
import { Warehouse, PackagePlus, SlidersHorizontal } from 'lucide-react';
import { api, apiErrorMessage } from '@/lib/api';
import { MouvementStock, Produit, Fournisseur, LotProduit } from '@/lib/types';
import EmptyState from '@/components/ui/EmptyState';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import { useAuthStore } from '@/store/authStore';

const CAN_GERER_STOCK = ['SUPER_ADMIN', 'GERANT', 'PHARMACIEN', 'MAGASINIER'];

const TYPE_LABEL: Record<string, { label: string; tone: 'success' | 'danger' | 'warning' | 'info' }> = {
  ENTREE_ACHAT: { label: 'Entrée', tone: 'success' },
  SORTIE_VENTE: { label: 'Sortie (vente)', tone: 'info' },
  AJUSTEMENT_POSITIF: { label: 'Ajustement +', tone: 'success' },
  AJUSTEMENT_NEGATIF: { label: 'Ajustement -', tone: 'warning' },
  PEREMPTION: { label: 'Péremption', tone: 'danger' },
  RETOUR_FOURNISSEUR: { label: 'Retour fournisseur', tone: 'warning' },
};

const entreeVide = { produitId: '', numeroLot: '', dateExpiration: '', quantite: '', prixAchatUnitaire: '', fournisseurId: '' };
const ajustementVide = { lotId: '', delta: '', motif: '' };

export default function StockPage() {
  const { utilisateur } = useAuthStore();
  const peutGerer = utilisateur ? CAN_GERER_STOCK.includes(utilisateur.role) : false;

  const [mouvements, setMouvements] = useState<MouvementStock[]>([]);
  const [produits, setProduits] = useState<Produit[]>([]);
  const [fournisseurs, setFournisseurs] = useState<Fournisseur[]>([]);
  const [lots, setLots] = useState<LotProduit[]>([]);
  const [chargement, setChargement] = useState(true);
  const [error, setError] = useState('');

  const [modalEntree, setModalEntree] = useState(false);
  const [formEntree, setFormEntree] = useState(entreeVide);
  const [modalAjustement, setModalAjustement] = useState(false);
  const [formAjustement, setFormAjustement] = useState(ajustementVide);
  const [enregistrement, setEnregistrement] = useState(false);

  async function charger() {
    setChargement(true);
    try {
      const [mvRes, produitsRes, fournisseursRes, lotsRes] = await Promise.all([
        api.get('/stock/mouvements', { params: { limit: 50 } }),
        api.get('/produits', { params: { tous: true } }),
        api.get('/fournisseurs'),
        api.get('/stock/lots'),
      ]);
      setMouvements(mvRes.data.data);
      setProduits(produitsRes.data.data);
      setFournisseurs(fournisseursRes.data.data);
      setLots(lotsRes.data.data);
    } catch (err) {
      setError(apiErrorMessage(err, 'Impossible de charger le stock'));
    } finally {
      setChargement(false);
    }
  }

  useEffect(() => {
    charger();
  }, []);

  async function soumettreEntree(e: React.FormEvent) {
    e.preventDefault();
    setEnregistrement(true);
    setError('');
    try {
      await api.post('/stock/entrees', { ...formEntree, fournisseurId: formEntree.fournisseurId || undefined });
      setModalEntree(false);
      setFormEntree(entreeVide);
      await charger();
    } catch (err) {
      setError(apiErrorMessage(err, "Impossible d'enregistrer l'entrée"));
    } finally {
      setEnregistrement(false);
    }
  }

  async function soumettreAjustement(e: React.FormEvent) {
    e.preventDefault();
    setEnregistrement(true);
    setError('');
    try {
      await api.post('/stock/ajustements', formAjustement);
      setModalAjustement(false);
      setFormAjustement(ajustementVide);
      await charger();
    } catch (err) {
      setError(apiErrorMessage(err, "Impossible d'ajuster le stock"));
    } finally {
      setEnregistrement(false);
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <p className="text-sm" style={{ color: 'var(--color-ink-3)' }}>50 derniers mouvements de stock</p>
        {peutGerer && (
          <div className="flex gap-2">
            <button className="btn btn-secondary" onClick={() => setModalAjustement(true)}>
              <SlidersHorizontal className="w-4 h-4" />
              Ajustement
            </button>
            <button className="btn btn-primary" onClick={() => setModalEntree(true)}>
              <PackagePlus className="w-4 h-4" />
              Nouvelle entrée
            </button>
          </div>
        )}
      </div>

      {error && (
        <div className="p-3 rounded-xl text-sm" style={{ background: 'var(--color-danger-soft)', color: 'var(--color-danger)' }}>
          {error}
        </div>
      )}

      <div className="card overflow-hidden">
        {!chargement && mouvements.length === 0 ? (
          <EmptyState icon={Warehouse} title="Aucun mouvement de stock" hint="Enregistrez une première entrée pour commencer" />
        ) : (
          <div className="overflow-x-auto">
            <table className="table-shell w-full">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Produit</th>
                  <th>Lot</th>
                  <th>Type</th>
                  <th>Quantité</th>
                  <th>Avant → Après</th>
                  <th>Par</th>
                </tr>
              </thead>
              <tbody>
                {mouvements.map((m) => {
                  const t = TYPE_LABEL[m.type] || { label: m.type, tone: 'info' as const };
                  return (
                    <tr key={m.id}>
                      <td>{new Date(m.createdAt).toLocaleString('fr-FR')}</td>
                      <td className="font-medium" style={{ color: 'var(--color-ink)' }}>{m.produit.nom}</td>
                      <td>{m.lot?.numeroLot || '—'}</td>
                      <td><Badge tone={t.tone}>{t.label}</Badge></td>
                      <td>{m.quantite}</td>
                      <td>{m.quantiteAvant} → {m.quantiteApres}</td>
                      <td>{m.utilisateur.prenom} {m.utilisateur.nom}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal open={modalEntree} onClose={() => setModalEntree(false)} title="Nouvelle entrée de stock" maxWidth={560}>
        <form onSubmit={soumettreEntree} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium" style={{ color: 'var(--color-ink-2)' }}>Produit</label>
            <select className="input" required value={formEntree.produitId} onChange={(e) => setFormEntree({ ...formEntree, produitId: e.target.value })}>
              <option value="">Sélectionner...</option>
              {produits.map((p) => (
                <option key={p.id} value={p.id}>{p.nom}{p.dosage ? ` — ${p.dosage}` : ''}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium" style={{ color: 'var(--color-ink-2)' }}>Numéro de lot</label>
              <input className="input" required value={formEntree.numeroLot} onChange={(e) => setFormEntree({ ...formEntree, numeroLot: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium" style={{ color: 'var(--color-ink-2)' }}>Date de péremption</label>
              <input type="date" className="input" required value={formEntree.dateExpiration} onChange={(e) => setFormEntree({ ...formEntree, dateExpiration: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium" style={{ color: 'var(--color-ink-2)' }}>Quantité</label>
              <input type="number" min={1} className="input" required value={formEntree.quantite} onChange={(e) => setFormEntree({ ...formEntree, quantite: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium" style={{ color: 'var(--color-ink-2)' }}>Prix d&apos;achat unitaire</label>
              <input type="number" min={0} step="0.01" className="input" required value={formEntree.prixAchatUnitaire} onChange={(e) => setFormEntree({ ...formEntree, prixAchatUnitaire: e.target.value })} />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium" style={{ color: 'var(--color-ink-2)' }}>Fournisseur</label>
            <select className="input" value={formEntree.fournisseurId} onChange={(e) => setFormEntree({ ...formEntree, fournisseurId: e.target.value })}>
              <option value="">Aucun</option>
              {fournisseurs.map((f) => (
                <option key={f.id} value={f.id}>{f.nom}</option>
              ))}
            </select>
          </div>

          {error && <div className="p-3 rounded-xl text-sm" style={{ background: 'var(--color-danger-soft)', color: 'var(--color-danger)' }}>{error}</div>}

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" className="btn btn-secondary" onClick={() => setModalEntree(false)}>Annuler</button>
            <button type="submit" disabled={enregistrement} className="btn btn-primary">{enregistrement ? 'Enregistrement...' : 'Enregistrer'}</button>
          </div>
        </form>
      </Modal>

      <Modal open={modalAjustement} onClose={() => setModalAjustement(false)} title="Ajustement de stock" maxWidth={480}>
        <form onSubmit={soumettreAjustement} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium" style={{ color: 'var(--color-ink-2)' }}>Lot</label>
            <select className="input" required value={formAjustement.lotId} onChange={(e) => setFormAjustement({ ...formAjustement, lotId: e.target.value })}>
              <option value="">Sélectionner...</option>
              {lots.map((l) => (
                <option key={l.id} value={l.id}>
                  {produits.find((p) => p.id === l.produitId)?.nom || 'Produit'} — Lot {l.numeroLot} ({l.quantiteActuelle} en stock)
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium" style={{ color: 'var(--color-ink-2)' }}>Quantité (négatif pour retirer)</label>
            <input type="number" className="input" required placeholder="ex: -5 ou 10" value={formAjustement.delta} onChange={(e) => setFormAjustement({ ...formAjustement, delta: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium" style={{ color: 'var(--color-ink-2)' }}>Motif</label>
            <input className="input" required placeholder="Casse, comptage physique, péremption..." value={formAjustement.motif} onChange={(e) => setFormAjustement({ ...formAjustement, motif: e.target.value })} />
          </div>

          {error && <div className="p-3 rounded-xl text-sm" style={{ background: 'var(--color-danger-soft)', color: 'var(--color-danger)' }}>{error}</div>}

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" className="btn btn-secondary" onClick={() => setModalAjustement(false)}>Annuler</button>
            <button type="submit" disabled={enregistrement} className="btn btn-primary">{enregistrement ? 'Enregistrement...' : 'Enregistrer'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
