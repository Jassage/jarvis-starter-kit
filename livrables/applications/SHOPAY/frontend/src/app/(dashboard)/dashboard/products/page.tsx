'use client';
import { useEffect, useState } from 'react';
import { Plus, Trash2, Pencil, Upload } from 'lucide-react';
import { useProductStore } from '@/stores/productStore';
import Badge from '@/components/ui/Badge';
import { formatMoney } from '@/lib/format';
import api from '@/lib/api';

const STATUS_LABEL: Record<string, string> = { DRAFT: 'Brouillon', ACTIVE: 'Publié', ARCHIVED: 'Archivé' };
const STATUS_TONE: Record<string, 'neutral' | 'success' | 'warning'> = { DRAFT: 'warning', ACTIVE: 'success', ARCHIVED: 'neutral' };

export default function ProductsPage() {
  const { products, categories, fetchProducts, fetchCategories, createProduct, updateProduct, deleteProduct } = useProductStore();
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ name: '', basePrice: '', categoryId: '', description: '', stockQty: '0', status: 'ACTIVE' as const });

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [fetchProducts, fetchCategories]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await createProduct({
        name: form.name,
        basePrice: Number(form.basePrice),
        categoryId: form.categoryId || undefined,
        description: form.description || undefined,
        stockQty: Number(form.stockQty),
        status: form.status,
      });
      setForm({ name: '', basePrice: '', categoryId: '', description: '', stockQty: '0', status: 'ACTIVE' });
      setShowForm(false);
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(message || 'Impossible de créer le produit');
    }
  };

  const toggleStatus = async (id: string, current: string) => {
    await updateProduct(id, { status: current === 'ACTIVE' ? 'ARCHIVED' : 'ACTIVE' });
  };

  const handleImageUpload = async (productId: string, file: File) => {
    const fd = new FormData();
    fd.append('image', file);
    await api.post(`/products/${productId}/images`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
    fetchProducts();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Produits</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--color-ink-3)' }}>{products.length} produit{products.length > 1 ? 's' : ''}</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn btn-primary">
          <Plus className="w-4 h-4" /> Nouveau produit
        </button>
      </div>

      {showForm && (
        <div className="card p-6">
          <form onSubmit={handleCreate} className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold mb-1.5">Nom du produit</label>
              <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input" />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1.5">Prix (HTG)</label>
              <input required type="number" min="0" step="0.01" value={form.basePrice} onChange={(e) => setForm({ ...form, basePrice: e.target.value })} className="input" />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1.5">Catégorie</label>
              <select value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })} className="input">
                <option value="">Aucune</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1.5">Stock initial</label>
              <input type="number" min="0" value={form.stockQty} onChange={(e) => setForm({ ...form, stockQty: e.target.value })} className="input" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold mb-1.5">Description</label>
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="input" rows={3} />
            </div>
            {error && (
              <div className="sm:col-span-2 text-sm p-3 rounded-xl font-medium" style={{ background: 'var(--color-danger-soft)', color: 'var(--color-danger)' }}>
                {error}
              </div>
            )}
            <div className="sm:col-span-2 flex gap-3">
              <button type="submit" className="btn btn-primary">Créer le produit</button>
              <button type="button" onClick={() => setShowForm(false)} className="btn btn-secondary">Annuler</button>
            </div>
          </form>
        </div>
      )}

      <div className="card overflow-x-auto">
        <table className="w-full table-shell">
          <thead>
            <tr>
              <th>Produit</th>
              <th>Catégorie</th>
              <th>Prix</th>
              <th>Stock</th>
              <th>Statut</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id}>
                <td className="font-semibold flex items-center gap-2">
                  {p.images[0] ? (
                    <img src={p.images[0].url} alt={p.name} className="w-8 h-8 rounded object-cover" />
                  ) : (
                    <div className="w-8 h-8 rounded" style={{ background: 'var(--color-line-2)' }} />
                  )}
                  {p.name}
                </td>
                <td>{categories.find((c) => c.id === p.categoryId)?.name ?? '—'}</td>
                <td>{formatMoney(p.basePrice, p.currency)}</td>
                <td>{p.trackStock ? p.stockQty : '—'}</td>
                <td><Badge tone={STATUS_TONE[p.status]}>{STATUS_LABEL[p.status]}</Badge></td>
                <td>
                  <div className="flex items-center gap-2">
                    <label className="cursor-pointer" title="Ajouter une image">
                      <Upload className="w-4 h-4" style={{ color: 'var(--color-ink-3)' }} />
                      <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleImageUpload(p.id, e.target.files[0])} />
                    </label>
                    <button onClick={() => toggleStatus(p.id, p.status)} title="Publier/Archiver">
                      <Pencil className="w-4 h-4" style={{ color: 'var(--color-ink-3)' }} />
                    </button>
                    <button onClick={() => deleteProduct(p.id)} title="Supprimer">
                      <Trash2 className="w-4 h-4" style={{ color: 'var(--color-danger)' }} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr><td colSpan={6} className="text-center py-8" style={{ color: 'var(--color-ink-3)' }}>Aucun produit. Créez-en un pour commencer.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
