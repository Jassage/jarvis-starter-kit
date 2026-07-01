'use client';
import { useState } from 'react';
import { StockLigne, useStockStore } from '@/stores/stockStore';

export default function AjustementForm({ stock, onDone }: { stock: StockLigne; onDone: () => void }) {
  const { ajusterStock } = useStockStore();
  const [type, setType] = useState<'ENTREE' | 'AJUSTEMENT'>('ENTREE');
  const [quantite, setQuantite] = useState('');
  const [raison, setRaison] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: { preventDefault(): void }) => {
    e.preventDefault();
    setError('');
    const qte = Number(quantite);
    if (!qte) {
      setError('Quantité requise');
      return;
    }
    setSubmitting(true);
    try {
      await ajusterStock({
        produitId: stock.produit.id,
        emplacementId: stock.emplacement.id,
        quantite: qte,
        type,
        raison: raison || undefined,
      });
      onDone();
    } catch (err: any) {
      setError(err.response?.data?.error || "Erreur lors de l'ajustement");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="p-3 rounded-xl text-sm" style={{ background: 'var(--color-line-2)', color: 'var(--color-ink-2)' }}>
        <strong style={{ color: 'var(--color-ink)' }}>{stock.produit.nom}</strong> · {stock.emplacement.nom}
        <br />
        Stock actuel : <strong>{stock.quantite} {stock.produit.unite}</strong>
      </div>

      <div className="flex gap-2">
        {(['ENTREE', 'AJUSTEMENT'] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setType(t)}
            className="flex-1 py-2 rounded-xl text-sm font-semibold transition-colors"
            style={{
              background: type === t ? 'var(--color-primary-soft)' : 'var(--color-line-2)',
              color: type === t ? 'var(--color-primary-2)' : 'var(--color-ink-2)',
            }}
          >
            {t === 'ENTREE' ? 'Entrée de stock' : 'Ajustement (+/-)'}
          </button>
        ))}
      </div>

      <div>
        <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--color-ink-2)' }}>
          Quantité {type === 'AJUSTEMENT' && '(négatif pour retirer)'}
        </label>
        <input type="number" className="input" required value={quantite} onChange={(e) => setQuantite(e.target.value)} />
      </div>

      <div>
        <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--color-ink-2)' }}>Raison (optionnel)</label>
        <input className="input" value={raison} onChange={(e) => setRaison(e.target.value)} placeholder="Ex : réception fournisseur, inventaire..." />
      </div>

      {error && (
        <div className="text-sm p-3 rounded-xl" style={{ background: 'var(--color-danger-soft)', color: 'var(--color-danger)' }}>
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="w-full py-3 rounded-xl font-bold text-sm text-white disabled:opacity-50"
        style={{ background: 'var(--color-primary-2)' }}
      >
        {submitting ? 'Enregistrement...' : 'Valider'}
      </button>
    </form>
  );
}
