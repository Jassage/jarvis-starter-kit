'use client';
import { useState } from 'react';
import Modal from '@/components/ui/Modal';
import { useInventaireStore, CategorieInventaire } from '@/stores/inventaireStore';

const CATEGORIE_LABEL: Record<CategorieInventaire, string> = {
  LINGE: 'Linge',
  CONSOMMABLE: 'Consommable',
  PRODUIT_ENTRETIEN: "Produit d'entretien",
  AUTRE: 'Autre',
};

export default function ArticleModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { creerArticle } = useInventaireStore();
  const [form, setForm] = useState({ nom: '', categorie: 'AUTRE' as CategorieInventaire, unite: 'unité', seuilAlerte: 0 });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await creerArticle(form);
      onClose();
      setForm({ nom: '', categorie: 'AUTRE', unite: 'unité', seuilAlerte: 0 });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Impossible de créer cet article');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Nouvel article d'inventaire" maxWidth={440}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input required placeholder="Nom de l'article" className="input" value={form.nom} onChange={(e) => setForm({ ...form, nom: e.target.value })} />

        <div>
          <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--color-ink-2)' }}>Catégorie</label>
          <select className="input" value={form.categorie} onChange={(e) => setForm({ ...form, categorie: e.target.value as CategorieInventaire })}>
            {Object.entries(CATEGORIE_LABEL).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <input required placeholder="Unité (ex. kg, L, unité)" className="input" value={form.unite} onChange={(e) => setForm({ ...form, unite: e.target.value })} />
          <input required type="number" min={0} placeholder="Seuil d'alerte" className="input" value={form.seuilAlerte} onChange={(e) => setForm({ ...form, seuilAlerte: Number(e.target.value) })} />
        </div>

        {error && <div className="p-3 rounded-xl text-sm" style={{ background: 'var(--color-danger-soft)', color: 'var(--color-danger)' }}>{error}</div>}

        <button type="submit" disabled={submitting} className="btn btn-primary w-full">{submitting ? 'Création...' : "Créer l'article"}</button>
      </form>
    </Modal>
  );
}
