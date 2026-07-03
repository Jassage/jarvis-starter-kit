'use client';
import { useEffect, useState } from 'react';
import { ChevronLeft, Search, Store, Warehouse } from 'lucide-react';
import { useStockStore, StockLigne } from '@/stores/stockStore';
import AjustementForm from '@/components/produits/AjustementForm';

export default function QuickAjustementModal({ onDone }: { onDone: () => void }) {
  const { stocks, fetchStock } = useStockStore();
  const [recherche, setRecherche] = useState('');
  const [selection, setSelection] = useState<StockLigne | null>(null);

  useEffect(() => {
    fetchStock();
  }, [fetchStock]);

  if (selection) {
    return (
      <div className="flex flex-col gap-3">
        <button
          onClick={() => setSelection(null)}
          className="inline-flex items-center gap-1.5 text-xs font-bold self-start"
          style={{ color: 'var(--color-ink-3)' }}
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          Choisir un autre produit
        </button>
        <AjustementForm stock={selection} onDone={onDone} />
      </div>
    );
  }

  const stocksFiltres = stocks.filter((s) =>
    s.produit.actif && (
      s.produit.nom.toLowerCase().includes(recherche.toLowerCase()) ||
      s.produit.reference.toLowerCase().includes(recherche.toLowerCase())
    )
  );

  return (
    <div className="flex flex-col gap-3">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--color-ink-3)' }} />
        <input
          autoFocus
          className="input pl-9"
          placeholder="Rechercher un produit à ajuster..."
          value={recherche}
          onChange={(e) => setRecherche(e.target.value)}
        />
      </div>
      <div className="space-y-2 max-h-80 overflow-y-auto">
        {stocksFiltres.map((s) => {
          const EmpIcon = s.emplacement.type === 'BOUTIQUE' ? Store : Warehouse;
          const sousAlerte = s.quantite <= s.produit.seuilAlerte;
          return (
            <button
              key={s.id}
              onClick={() => setSelection(s)}
              className="w-full flex items-center justify-between p-3 rounded-xl text-left transition-colors"
              style={{ background: 'var(--color-line-2)' }}
            >
              <div className="flex items-center gap-3 min-w-0">
                <span
                  className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                  style={{ background: 'var(--color-surface)', color: 'var(--color-ink-3)' }}
                >
                  <EmpIcon className="w-4 h-4" />
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-semibold truncate" style={{ color: 'var(--color-ink)' }}>{s.produit.nom}</p>
                  <p className="text-xs truncate" style={{ color: 'var(--color-ink-3)' }}>{s.emplacement.nom} · réf. {s.produit.reference}</p>
                </div>
              </div>
              <span
                className="text-sm font-bold shrink-0 ml-2"
                style={{ color: sousAlerte ? 'var(--color-danger)' : 'var(--color-ink)' }}
              >
                {s.quantite} {s.produit.unite}
              </span>
            </button>
          );
        })}
        {stocksFiltres.length === 0 && (
          <p className="text-sm text-center py-8" style={{ color: 'var(--color-ink-3)' }}>Aucun produit trouvé</p>
        )}
      </div>
    </div>
  );
}
