'use client';
import { useEffect, useState } from 'react';
import { Package } from 'lucide-react';
import { useProduitStore, Produit } from '@/stores/produitStore';
import Modal from '@/components/ui/Modal';
import Badge from '@/components/ui/Badge';
import PageToolbar from '@/components/ui/PageToolbar';
import EmptyState from '@/components/ui/EmptyState';
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
      <PageToolbar search={search} onSearch={handleSearch} searchPlaceholder="Rechercher par nom ou référence..." actionLabel="Nouveau produit" onAction={openCreate} />

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full table-shell">
            <thead>
              <tr>
                {['Référence', 'Nom', 'Catégorie', 'Stock total', 'Prix détail', 'Prix gros', 'Seuil', ''].map((h) => (
                  <th key={h}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {produits.map((p) => (
                <tr key={p.id}>
                  <td className="font-mono text-xs" style={{ color: 'var(--color-ink-3)' }}>{p.reference}</td>
                  <td className="font-semibold" style={{ color: 'var(--color-ink)' }}>{p.nom}</td>
                  <td>{p.categorie || '—'}</td>
                  <td>
                    <Badge tone={(p.stockTotal ?? 0) <= p.seuilAlerte ? 'danger' : 'success'}>
                      {p.stockTotal ?? 0} {p.unite}
                    </Badge>
                  </td>
                  <td style={{ color: 'var(--color-ink)' }}>{formatMontant(p.prixVenteDetail)} HTG</td>
                  <td>{p.prixVenteGros ? `${formatMontant(p.prixVenteGros)} HTG` : '—'}</td>
                  <td style={{ color: 'var(--color-ink-3)' }}>{p.seuilAlerte}</td>
                  <td className="text-right space-x-3 whitespace-nowrap">
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
          <EmptyState icon={Package} title="Aucun produit pour le moment" />
        )}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Modifier le produit' : 'Nouveau produit'} maxWidth={560}>
        <ProduitForm produit={editing} onDone={() => setModalOpen(false)} />
      </Modal>
    </div>
  );
}
