'use client';
import { useState, useEffect } from 'react';
import { Plus, Search, Trash2 } from 'lucide-react';
import { useProduitStore, Produit } from '@/stores/produitStore';
import { useFournisseurStore } from '@/stores/fournisseurStore';
import { useEmplacementStore } from '@/stores/emplacementStore';
import { useAchatStore } from '@/stores/achatStore';
import { formatMontant } from '@/lib/utils';

interface Ligne { produit: Produit; quantite: number; prixAchat: number }

export default function NouvelleCommandeModal({ onDone }: { onDone: () => void }) {
  const { produits, fetchProduits } = useProduitStore();
  const { fournisseurs, fetchFournisseurs } = useFournisseurStore();
  const { emplacements, fetchEmplacements } = useEmplacementStore();
  const { createCommande } = useAchatStore();

  const [recherche, setRecherche] = useState('');
  const [lignes, setLignes] = useState<Ligne[]>([]);
  const [fournisseurId, setFournisseurId] = useState('');
  const [emplacementId, setEmplacementId] = useState('');
  const [notes, setNotes] = useState('');
  const [dateLivraisonPrevue, setDateLivraisonPrevue] = useState('');
  const [activeTab, setActiveTab] = useState<'produits' | 'commande'>('produits');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchProduits();
    fetchFournisseurs();
    fetchEmplacements();
  }, [fetchProduits, fetchFournisseurs, fetchEmplacements]);

  useEffect(() => {
    if (emplacements.length > 0 && !emplacementId) setEmplacementId(emplacements[0].id);
  }, [emplacements, emplacementId]);

  const produitsFiltres = produits.filter((p) =>
    p.actif && (p.nom.toLowerCase().includes(recherche.toLowerCase()) || p.reference.toLowerCase().includes(recherche.toLowerCase()))
  );

  const totalCommande = lignes.reduce((sum, l) => sum + l.quantite * l.prixAchat, 0);

  const ajouterProduit = (produit: Produit) => {
    setLignes((prev) => {
      const exist = prev.find((l) => l.produit.id === produit.id);
      if (exist) return prev.map((l) => l.produit.id === produit.id ? { ...l, quantite: l.quantite + 1 } : l);
      return [...prev, { produit, quantite: 1, prixAchat: Number(produit.prixAchatMoyen) }];
    });
    setActiveTab('commande');
  };

  const handleSubmit = async () => {
    setError('');
    if (!fournisseurId) { setError('Sélectionnez un fournisseur'); return; }
    if (!emplacementId) { setError('Sélectionnez un emplacement de destination'); return; }
    if (lignes.length === 0) { setError('Ajoutez au moins un produit'); return; }
    setSubmitting(true);
    try {
      await createCommande({
        fournisseurId,
        emplacementId,
        notes: notes || undefined,
        dateLivraisonPrevue: dateLivraisonPrevue || undefined,
        lignes: lignes.map((l) => ({ produitId: l.produit.id, quantiteCommandee: l.quantite, prixUnitaireAchat: l.prixAchat })),
      });
      onDone();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erreur lors de la création');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--color-ink-2)' }}>Fournisseur</label>
          <select className="input" value={fournisseurId} onChange={(e) => setFournisseurId(e.target.value)}>
            <option value="">Choisir...</option>
            {fournisseurs.map((f) => <option key={f.id} value={f.id}>{f.nom}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--color-ink-2)' }}>Destination (emplacement)</label>
          <select className="input" value={emplacementId} onChange={(e) => setEmplacementId(e.target.value)}>
            {emplacements.map((e) => <option key={e.id} value={e.id}>{e.nom}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--color-ink-2)' }}>Livraison prévue</label>
          <input type="date" className="input" value={dateLivraisonPrevue} onChange={(e) => setDateLivraisonPrevue(e.target.value)} />
        </div>
        <div>
          <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--color-ink-2)' }}>Notes</label>
          <input className="input" placeholder="Optionnel..." value={notes} onChange={(e) => setNotes(e.target.value)} />
        </div>
      </div>

      <div className="flex gap-1 p-1 rounded-xl sm:hidden" style={{ background: 'var(--color-line-2)' }}>
        {(['produits', 'commande'] as const).map((t) => (
          <button key={t} onClick={() => setActiveTab(t)} className="flex-1 py-2 rounded-lg text-sm font-semibold transition-colors"
            style={{ background: activeTab === t ? 'var(--color-surface)' : 'transparent', color: activeTab === t ? 'var(--color-ink)' : 'var(--color-ink-3)' }}>
            {t === 'produits' ? 'Produits' : `Commande (${lignes.length})`}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className={activeTab === 'commande' ? 'hidden sm:block' : ''}>
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--color-ink-3)' }} />
            <input className="input pl-9" placeholder="Rechercher un produit..." value={recherche} onChange={(e) => setRecherche(e.target.value)} />
          </div>
          <div className="space-y-2 max-h-56 overflow-y-auto">
            {produitsFiltres.map((p) => (
              <button key={p.id} onClick={() => ajouterProduit(p)} className="w-full flex items-center justify-between p-3 rounded-xl text-left"
                style={{ background: 'var(--color-line-2)' }}>
                <div>
                  <p className="text-sm font-semibold" style={{ color: 'var(--color-ink)' }}>{p.nom}</p>
                  <p className="text-xs" style={{ color: 'var(--color-ink-3)' }}>CUMP : {formatMontant(p.prixAchatMoyen)} HTG</p>
                </div>
                <Plus className="w-4 h-4 shrink-0" style={{ color: 'var(--color-primary-2)' }} />
              </button>
            ))}
          </div>
        </div>

        <div className={activeTab === 'produits' ? 'hidden sm:block' : ''}>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {lignes.length === 0 && <p className="text-sm text-center py-8" style={{ color: 'var(--color-ink-3)' }}>Aucun produit ajouté</p>}
            {lignes.map((l) => (
              <div key={l.produit.id} className="p-3 rounded-xl" style={{ background: 'var(--color-line-2)' }}>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <p className="text-sm font-semibold" style={{ color: 'var(--color-ink)' }}>{l.produit.nom}</p>
                  <button onClick={() => setLignes((prev) => prev.filter((x) => x.produit.id !== l.produit.id))}>
                    <Trash2 className="w-4 h-4" style={{ color: 'var(--color-danger)' }} />
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => setLignes((prev) => prev.map((x) => x.produit.id === l.produit.id ? { ...x, quantite: Math.max(1, x.quantite - 1) } : x))}
                    className="w-7 h-7 rounded-lg text-sm font-bold" style={{ background: 'var(--color-surface)' }}>−</button>
                  <span className="text-sm font-semibold w-8 text-center">{l.quantite}</span>
                  <button onClick={() => setLignes((prev) => prev.map((x) => x.produit.id === l.produit.id ? { ...x, quantite: x.quantite + 1 } : x))}
                    className="w-7 h-7 rounded-lg text-sm font-bold" style={{ background: 'var(--color-surface)' }}>+</button>
                  <span className="text-xs mx-1" style={{ color: 'var(--color-ink-3)' }}>×</span>
                  <input type="number" min={0} step="0.01" value={l.prixAchat}
                    onChange={(e) => setLignes((prev) => prev.map((x) => x.produit.id === l.produit.id ? { ...x, prixAchat: Number(e.target.value) } : x))}
                    className="flex-1 text-sm text-right rounded-lg px-2 py-0.5" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-line)' }} />
                  <span className="text-xs shrink-0" style={{ color: 'var(--color-ink-3)' }}>HTG</span>
                </div>
                <p className="text-xs text-right mt-1 font-semibold" style={{ color: 'var(--color-ink)' }}>{formatMontant(l.quantite * l.prixAchat)} HTG</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="pt-2 border-t space-y-3" style={{ borderColor: 'var(--color-line)' }}>
        <div className="flex items-center justify-between">
          <span className="font-semibold" style={{ color: 'var(--color-ink-2)' }}>Total commande</span>
          <span className="text-2xl font-extrabold" style={{ color: 'var(--color-ink)' }}>{formatMontant(totalCommande)} HTG</span>
        </div>
        {error && <div className="text-sm p-3 rounded-xl" style={{ background: 'var(--color-danger-soft)', color: 'var(--color-danger)' }}>{error}</div>}
        <button onClick={handleSubmit} disabled={submitting || lignes.length === 0}
          className="w-full py-3.5 rounded-2xl font-bold text-base text-white disabled:opacity-40"
          style={{ background: 'linear-gradient(135deg, #16a34a, #059669)' }}>
          {submitting ? 'Enregistrement...' : `Créer la commande · ${formatMontant(totalCommande)} HTG`}
        </button>
      </div>
    </div>
  );
}
