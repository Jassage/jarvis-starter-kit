'use client';
import { useState, useEffect, useMemo } from 'react';
import { Plus, Search, Trash2 } from 'lucide-react';
import { useEmplacementStore } from '@/stores/emplacementStore';
import { useStockStore } from '@/stores/stockStore';
import { useTransfertStore } from '@/stores/transfertStore';

interface Ligne { produitId: string; nom: string; unite: string; disponible: number; quantite: number }

export default function NouveauTransfertModal({ onDone }: { onDone: () => void }) {
  const { emplacements, fetchEmplacements } = useEmplacementStore();
  const { stocks, fetchStock } = useStockStore();
  const { createTransfert } = useTransfertStore();

  const [recherche, setRecherche] = useState('');
  const [lignes, setLignes] = useState<Ligne[]>([]);
  const [emplacementSourceId, setEmplacementSourceId] = useState('');
  const [emplacementDestId, setEmplacementDestId] = useState('');
  const [notes, setNotes] = useState('');
  const [activeTab, setActiveTab] = useState<'produits' | 'transfert'>('produits');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { fetchEmplacements(); }, [fetchEmplacements]);

  useEffect(() => {
    if (emplacements.length > 0 && !emplacementSourceId) setEmplacementSourceId(emplacements[0].id);
  }, [emplacements, emplacementSourceId]);

  useEffect(() => {
    if (emplacementSourceId) {
      fetchStock(emplacementSourceId);
      setLignes([]);
    }
  }, [emplacementSourceId, fetchStock]);

  const emplacementsDest = emplacements.filter((e) => e.id !== emplacementSourceId);

  useEffect(() => {
    if (emplacementsDest.length > 0 && (!emplacementDestId || emplacementDestId === emplacementSourceId)) {
      setEmplacementDestId(emplacementsDest[0].id);
    }
  }, [emplacementsDest, emplacementDestId, emplacementSourceId]);

  const stocksDisponibles = useMemo(
    () => stocks.filter((s) => s.produit.actif && s.quantite > 0),
    [stocks]
  );

  const stocksFiltres = stocksDisponibles.filter((s) =>
    s.produit.nom.toLowerCase().includes(recherche.toLowerCase()) || s.produit.reference.toLowerCase().includes(recherche.toLowerCase())
  );

  const ajouterProduit = (s: (typeof stocksDisponibles)[number]) => {
    setLignes((prev) => {
      const exist = prev.find((l) => l.produitId === s.produit.id);
      if (exist) return prev.map((l) => l.produitId === s.produit.id ? { ...l, quantite: Math.min(l.quantite + 1, l.disponible) } : l);
      return [...prev, { produitId: s.produit.id, nom: s.produit.nom, unite: s.produit.unite, disponible: s.quantite, quantite: 1 }];
    });
    setActiveTab('transfert');
  };

  const handleSubmit = async () => {
    setError('');
    if (!emplacementSourceId) { setError('Sélectionnez un emplacement source'); return; }
    if (!emplacementDestId) { setError('Sélectionnez un emplacement de destination'); return; }
    if (emplacementSourceId === emplacementDestId) { setError('La source et la destination doivent être différentes'); return; }
    if (lignes.length === 0) { setError('Ajoutez au moins un produit'); return; }
    setSubmitting(true);
    try {
      await createTransfert({
        emplacementSourceId,
        emplacementDestId,
        notes: notes || undefined,
        lignes: lignes.map((l) => ({ produitId: l.produitId, quantite: l.quantite })),
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
          <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--color-ink-2)' }}>Source</label>
          <select className="input" value={emplacementSourceId} onChange={(e) => setEmplacementSourceId(e.target.value)}>
            {emplacements.map((e) => <option key={e.id} value={e.id}>{e.nom}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--color-ink-2)' }}>Destination</label>
          <select className="input" value={emplacementDestId} onChange={(e) => setEmplacementDestId(e.target.value)}>
            {emplacementsDest.map((e) => <option key={e.id} value={e.id}>{e.nom}</option>)}
          </select>
        </div>
        <div className="sm:col-span-2">
          <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--color-ink-2)' }}>Notes</label>
          <input className="input" placeholder="Optionnel..." value={notes} onChange={(e) => setNotes(e.target.value)} />
        </div>
      </div>

      <div className="flex gap-1 p-1 rounded-xl sm:hidden" style={{ background: 'var(--color-line-2)' }}>
        {(['produits', 'transfert'] as const).map((t) => (
          <button key={t} onClick={() => setActiveTab(t)} className="flex-1 py-2 rounded-lg text-sm font-semibold transition-colors"
            style={{ background: activeTab === t ? 'var(--color-surface)' : 'transparent', color: activeTab === t ? 'var(--color-ink)' : 'var(--color-ink-3)' }}>
            {t === 'produits' ? 'Stock source' : `Transfert (${lignes.length})`}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className={activeTab === 'transfert' ? 'hidden sm:block' : ''}>
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--color-ink-3)' }} />
            <input className="input pl-9" placeholder="Rechercher un produit en stock..." value={recherche} onChange={(e) => setRecherche(e.target.value)} />
          </div>
          <div className="space-y-2 max-h-56 overflow-y-auto">
            {stocksFiltres.map((s) => (
              <button key={s.id} onClick={() => ajouterProduit(s)} className="w-full flex items-center justify-between p-3 rounded-xl text-left"
                style={{ background: 'var(--color-line-2)' }}>
                <div>
                  <p className="text-sm font-semibold" style={{ color: 'var(--color-ink)' }}>{s.produit.nom}</p>
                  <p className="text-xs" style={{ color: 'var(--color-ink-3)' }}>Disponible : {s.quantite} {s.produit.unite}</p>
                </div>
                <Plus className="w-4 h-4 shrink-0" style={{ color: 'var(--color-primary-2)' }} />
              </button>
            ))}
            {stocksFiltres.length === 0 && (
              <p className="text-sm text-center py-8" style={{ color: 'var(--color-ink-3)' }}>Aucun produit disponible à cet emplacement</p>
            )}
          </div>
        </div>

        <div className={activeTab === 'produits' ? 'hidden sm:block' : ''}>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {lignes.length === 0 && <p className="text-sm text-center py-8" style={{ color: 'var(--color-ink-3)' }}>Aucun produit ajouté</p>}
            {lignes.map((l) => (
              <div key={l.produitId} className="p-3 rounded-xl" style={{ background: 'var(--color-line-2)' }}>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <p className="text-sm font-semibold" style={{ color: 'var(--color-ink)' }}>{l.nom}</p>
                  <button onClick={() => setLignes((prev) => prev.filter((x) => x.produitId !== l.produitId))}>
                    <Trash2 className="w-4 h-4" style={{ color: 'var(--color-danger)' }} />
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => setLignes((prev) => prev.map((x) => x.produitId === l.produitId ? { ...x, quantite: Math.max(1, x.quantite - 1) } : x))}
                    className="w-7 h-7 rounded-lg text-sm font-bold" style={{ background: 'var(--color-surface)' }}>−</button>
                  <span className="text-sm font-semibold w-8 text-center">{l.quantite}</span>
                  <button onClick={() => setLignes((prev) => prev.map((x) => x.produitId === l.produitId ? { ...x, quantite: Math.min(x.quantite + 1, x.disponible) } : x))}
                    className="w-7 h-7 rounded-lg text-sm font-bold" style={{ background: 'var(--color-surface)' }}>+</button>
                  <span className="text-xs ml-auto" style={{ color: 'var(--color-ink-3)' }}>/ {l.disponible} {l.unite} disponible</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="pt-2 border-t space-y-3" style={{ borderColor: 'var(--color-line)' }}>
        {error && <div className="text-sm p-3 rounded-xl" style={{ background: 'var(--color-danger-soft)', color: 'var(--color-danger)' }}>{error}</div>}
        <button onClick={handleSubmit} disabled={submitting || lignes.length === 0}
          className="w-full py-3.5 rounded-2xl font-bold text-base text-white disabled:opacity-40"
          style={{ background: 'linear-gradient(135deg, #16a34a, #059669)' }}>
          {submitting ? 'Envoi...' : `Envoyer le transfert · ${lignes.length} produit${lignes.length > 1 ? 's' : ''}`}
        </button>
      </div>
    </div>
  );
}
