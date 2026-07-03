'use client';
import { useEffect, useState } from 'react';
import { AlertTriangle, Boxes, History } from 'lucide-react';
import { useStockStore, StockLigne } from '@/stores/stockStore';
import { useEmplacementStore } from '@/stores/emplacementStore';
import Modal from '@/components/ui/Modal';
import Badge from '@/components/ui/Badge';
import EmptyState from '@/components/ui/EmptyState';
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
        <div className="card p-4 flex items-start gap-3" style={{ background: 'var(--color-warning-soft)', border: '1px solid rgba(217,119,6,0.2)' }}>
          <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" style={{ color: 'var(--color-warning)' }} />
          <div>
            <p className="text-sm font-bold mb-2" style={{ color: 'var(--color-warning)' }}>
              {alertes.length} produit(s) sous le seuil d&apos;alerte
            </p>
            <div className="flex flex-wrap gap-2">
              {alertes.map((a) => (
                <span key={`${a.produitId}-${a.emplacement.id}`} className="text-xs px-2.5 py-1 rounded-full font-medium" style={{ background: 'var(--color-surface)', color: 'var(--color-ink-2)' }}>
                  {a.nom} · {a.emplacement.nom} ({a.quantite}/{a.seuilAlerte})
                </span>
              ))}
            </div>
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
            <table className="w-full table-shell">
              <thead>
                <tr>
                  {['Produit', 'Emplacement', 'Quantité', 'Seuil', ''].map((h) => (
                    <th key={h}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {stocks.map((s) => (
                  <tr key={s.id}>
                    <td className="font-semibold whitespace-nowrap" style={{ color: 'var(--color-ink)' }}>{s.produit.nom}</td>
                    <td className="whitespace-nowrap">{s.emplacement.nom}</td>
                    <td>
                      <Badge tone={s.quantite <= s.produit.seuilAlerte ? 'danger' : 'success'}>
                        {s.quantite} {s.produit.unite}
                      </Badge>
                    </td>
                    <td style={{ color: 'var(--color-ink-3)' }}>{s.produit.seuilAlerte}</td>
                    <td className="text-right">
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
            <EmptyState icon={Boxes} title="Aucune ligne de stock" hint="Créez un produit pour générer les lignes de stock par emplacement." />
          )}
        </div>

        <div className="card p-5">
          <h3 className="text-sm font-bold mb-4 flex items-center gap-2" style={{ color: 'var(--color-ink)' }}>
            <History className="w-4 h-4" style={{ color: 'var(--color-ink-3)' }} />
            Mouvements récents
          </h3>
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
