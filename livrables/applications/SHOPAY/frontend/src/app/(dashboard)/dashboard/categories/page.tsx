'use client';
import { useEffect, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { useProductStore } from '@/stores/productStore';
import api from '@/lib/api';

export default function CategoriesPage() {
  const { categories, fetchCategories, createCategory } = useProductStore();
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!name.trim()) return;
    try {
      await createCategory(name.trim());
      setName('');
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(message || 'Impossible de créer la catégorie');
    }
  };

  const handleDelete = async (id: string) => {
    await api.delete(`/categories/${id}`);
    fetchCategories();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight">Catégories</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--color-ink-3)' }}>Organisez votre catalogue par catégorie.</p>
      </div>

      <form onSubmit={handleCreate} className="flex gap-3 max-w-md">
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nom de la catégorie" className="input" />
        <button type="submit" className="btn btn-primary shrink-0"><Plus className="w-4 h-4" /> Ajouter</button>
      </form>
      {error && (
        <div className="text-sm p-3 rounded-xl font-medium max-w-md" style={{ background: 'var(--color-danger-soft)', color: 'var(--color-danger)' }}>
          {error}
        </div>
      )}

      <div className="card divide-y" style={{ borderColor: 'var(--color-line-2)' }}>
        {categories.map((c) => (
          <div key={c.id} className="flex items-center justify-between px-5 py-3.5" style={{ borderColor: 'var(--color-line-2)' }}>
            <span className="font-semibold">{c.name}</span>
            <button onClick={() => handleDelete(c.id)}><Trash2 className="w-4 h-4" style={{ color: 'var(--color-danger)' }} /></button>
          </div>
        ))}
        {categories.length === 0 && (
          <p className="text-center py-8 text-sm" style={{ color: 'var(--color-ink-3)' }}>Aucune catégorie pour l&apos;instant</p>
        )}
      </div>
    </div>
  );
}
