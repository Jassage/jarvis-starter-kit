'use client';
import { useEffect, useState } from 'react';
import { useProduitStore, Produit } from '@/stores/produitStore';
import Modal from '@/components/ui/Modal';
import ProduitForm from '@/components/produits/ProduitForm';

function formatMontant(value: string | number) {
  return new Intl.NumberFormat('fr-HT', { maximumFractionDigits: 2 }).format(Number(value));
}

export default function ProduitsPage() {
  const { produits, isLoading, fetchProduits, archiveProduit } = useProduitStore();
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Produit | undefined>(undefined);

  useEffect(() => {
    fetchProduits();
  }, [fetchProduits]);

  const handleSearch = async (value: string) => {
    setSearch(value);
    await fetchProduits(value || undefined);
  };

  const openCreate = () => {
    setEditing(undefined);
    setModalOpen(true);
  };

  const openEdit = (p: Produit) => {
    setEditing(p);
    setModalOpen(true);
  };

  const handleArchive = async (p: Produit) => {
    if (!confirm(`Archiver le produit "${p.nom}" ?`)) return;
    await archiveProduit(p.id);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <input
          className="input sm:max-w-xs"
          placeholder="Rechercher par nom ou référence..."
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
        />
        <button
          onClick={openCreate}
          className="px-4 py-2.5 rounded-xl text-sm font-bold text-white shrink-0"
          style={{ background: 'var(--color-primary-2)' }}
        >
          + Nouveau produit
        </button>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr style={{ background: 'var(--color-line-2)' }}>
              {['Référence', 'Nom', 'Catégorie', 'Stock total', 'Prix détail', 'Prix gros', 'Seuil', ''].map((h) => (
                <th key={h} className="text-left px-4 py-3 font-semibold whitespace-nowrap" style={{ color: 'var(--color-ink-2)' }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {produits.map((p) => (
              <tr key={p.id} className="border-t" style={{ borderColor: 'var(--color-line-2)' }}>
                <td className="px-4 py-3 font-mono text-xs" style={{ color: 'var(--color-ink-3)' }}>{p.reference}</td>
                <td className="px-4 py-3 font-medium" style={{ color: 'var(--color-ink)' }}>{p.nom}</td>
                <td className="px-4 py-3" style={{ color: 'var(--color-ink-2)' }}>{p.categorie || '—'}</td>
                <td className="px-4 py-3">
                  <span
                    className="px-2 py-0.5 rounded-full text-xs font-semibold"
                    style={{
                      background: (p.stockTotal ?? 0) <= p.seuilAlerte ? 'var(--color-danger-soft)' : 'var(--color-success-soft)',
                      color: (p.stockTotal ?? 0) <= p.seuilAlerte ? 'var(--color-danger)' : 'var(--color-success)',
                    }}
                  >
                    {p.stockTotal ?? 0} {p.unite}
                  </span>
                </td>
                <td className="px-4 py-3" style={{ color: 'var(--color-ink)' }}>{formatMontant(p.prixVenteDetail)} HTG</td>
                <td className="px-4 py-3" style={{ color: 'var(--color-ink-2)' }}>{p.prixVenteGros ? `${formatMontant(p.prixVenteGros)} HTG` : '—'}</td>
                <td className="px-4 py-3" style={{ color: 'var(--color-ink-3)' }}>{p.seuilAlerte}</td>
                <td className="px-4 py-3 text-right space-x-3 whitespace-nowrap">
                  <button onClick={() => openEdit(p)} className="text-xs font-semibold" style={{ color: 'var(--color-primary-2)' }}>
                    Modifier
                  </button>
                  <button onClick={() => handleArchive(p)} className="text-xs font-semibold" style={{ color: 'var(--color-danger)' }}>
                    Archiver
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
        {!isLoading && produits.length === 0 && (
          <div className="text-center py-12 text-sm" style={{ color: 'var(--color-ink-3)' }}>
            Aucun produit pour le moment.
          </div>
        )}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Modifier le produit' : 'Nouveau produit'} maxWidth={560}>
        <ProduitForm produit={editing} onDone={() => setModalOpen(false)} />
      </Modal>
    </div>
  );
}
