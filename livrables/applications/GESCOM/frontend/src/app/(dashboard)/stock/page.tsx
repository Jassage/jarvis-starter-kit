'use client';
import { useEffect, useState } from 'react';
import { useStockStore, StockLigne } from '@/stores/stockStore';
import { useEmplacementStore } from '@/stores/emplacementStore';
import Modal from '@/components/ui/Modal';
import AjustementForm from '@/components/produits/AjustementForm';

export default function StockPage() {
  const { stocks, alertes, mouvements, fetchStock, fetchAlertes, fetchMouvements } = useStockStore();
  const { emplacements, fetchEmplacements } = useEmplacementStore();
  const [filtreEmplacement, setFiltreEmplacement] = useState('');
  const [modalStock, setModalStock] = useState<StockLigne | null>(null);

  useEffect(() => {
    fetchEmplacements();
    fetchStock();
    fetchAlertes();
    fetchMouvements();
  }, [fetchEmplacements, fetchStock, fetchAlertes, fetchMouvements]);

  const handleFiltre = async (id: string) => {
    setFiltreEmplacement(id);
    await fetchStock(id || undefined);
  };

  return (
    <div className="space-y-6">
      {alertes.length > 0 && (
        <div className="card p-4" style={{ background: 'var(--color-warning-soft)', border: '1px solid rgba(245,158,11,0.25)' }}>
          <p className="text-sm font-bold mb-2" style={{ color: 'var(--color-warning)' }}>
            ⚠ {alertes.length} produit(s) sous le seuil d&apos;alerte
          </p>
          <div className="flex flex-wrap gap-2">
            {alertes.map((a) => (
              <span key={`${a.produitId}-${a.emplacement.id}`} className="text-xs px-2.5 py-1 rounded-full" style={{ background: 'white', color: 'var(--color-ink-2)' }}>
                {a.nom} · {a.emplacement.nom} ({a.quantite}/{a.seuilAlerte})
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center gap-3">
        <span className="text-sm font-semibold whitespace-nowrap" style={{ color: 'var(--color-ink-2)' }}>Emplacement :</span>
        <select className="input sm:max-w-xs" value={filtreEmplacement} onChange={(e) => handleFiltre(e.target.value)}>
          <option value="">Tous les emplacements</option>
          {emplacements.map((e) => (
            <option key={e.id} value={e.id}>{e.nom}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 card overflow-hidden">
          <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: 'var(--color-line-2)' }}>
                {['Produit', 'Emplacement', 'Quantité', 'Seuil', ''].map((h) => (
                  <th key={h} className="text-left px-4 py-3 font-semibold whitespace-nowrap" style={{ color: 'var(--color-ink-2)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {stocks.map((s) => (
                <tr key={s.id} className="border-t" style={{ borderColor: 'var(--color-line-2)' }}>
                  <td className="px-4 py-3 font-medium whitespace-nowrap" style={{ color: 'var(--color-ink)' }}>{s.produit.nom}</td>
                  <td className="px-4 py-3 whitespace-nowrap" style={{ color: 'var(--color-ink-2)' }}>{s.emplacement.nom}</td>
                  <td className="px-4 py-3">
                    <span
                      className="px-2 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap"
                      style={{
                        background: s.quantite <= s.produit.seuilAlerte ? 'var(--color-danger-soft)' : 'var(--color-success-soft)',
                        color: s.quantite <= s.produit.seuilAlerte ? 'var(--color-danger)' : 'var(--color-success)',
                      }}
                    >
                      {s.quantite} {s.produit.unite}
                    </span>
                  </td>
                  <td className="px-4 py-3" style={{ color: 'var(--color-ink-3)' }}>{s.produit.seuilAlerte}</td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => setModalStock(s)} className="text-xs font-semibold whitespace-nowrap" style={{ color: 'var(--color-primary-2)' }}>
                      Ajuster
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
          {stocks.length === 0 && (
            <div className="text-center py-12 text-sm" style={{ color: 'var(--color-ink-3)' }}>
              Aucune ligne de stock. Créez un produit pour générer les lignes de stock par emplacement.
            </div>
          )}
        </div>

        <div className="card p-5">
          <h3 className="text-sm font-bold mb-4" style={{ color: 'var(--color-ink)' }}>Mouvements récents</h3>
          <ul className="space-y-3">
            {mouvements.slice(0, 10).map((m) => (
              <li key={m.id} className="text-xs pb-3 border-b last:border-0" style={{ borderColor: 'var(--color-line-2)' }}>
                <div className="flex justify-between mb-0.5">
                  <span className="font-semibold" style={{ color: 'var(--color-ink)' }}>{m.produit.nom}</span>
                  <span style={{ color: m.quantite > 0 ? 'var(--color-success)' : 'var(--color-danger)' }}>
                    {m.quantite > 0 ? '+' : ''}{m.quantite}
                  </span>
                </div>
                <span style={{ color: 'var(--color-ink-3)' }}>
                  {m.type} · {m.emplacement.nom} · {new Date(m.createdAt).toLocaleDateString('fr-FR')}
                </span>
              </li>
            ))}
            {mouvements.length === 0 && (
              <li className="text-sm" style={{ color: 'var(--color-ink-3)' }}>Aucun mouvement encore.</li>
            )}
          </ul>
        </div>
      </div>

      <Modal open={!!modalStock} onClose={() => setModalStock(null)} title="Ajuster le stock">
        {modalStock && <AjustementForm stock={modalStock} onDone={() => setModalStock(null)} />}
      </Modal>
    </div>
  );
}
