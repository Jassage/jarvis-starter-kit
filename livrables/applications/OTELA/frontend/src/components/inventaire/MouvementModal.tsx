'use client';
import { useState } from 'react';
import Modal from '@/components/ui/Modal';
import { useInventaireStore, ArticleInventaire, TypeMouvement } from '@/stores/inventaireStore';

const TYPE_LABEL: Record<TypeMouvement, string> = { ENTREE: 'Entrée de stock', SORTIE: 'Sortie de stock', AJUSTEMENT: 'Ajustement (inventaire physique)' };

export default function MouvementModal({ open, onClose, article }: { open: boolean; onClose: () => void; article: ArticleInventaire | null }) {
  const { enregistrerMouvement } = useInventaireStore();
  const [form, setForm] = useState({ type: 'ENTREE' as TypeMouvement, quantite: 0, motif: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!article) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await enregistrerMouvement(article.id, { type: form.type, quantite: form.quantite, motif: form.motif || undefined });
      onClose();
      setForm({ type: 'ENTREE', quantite: 0, motif: '' });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Impossible d\'enregistrer ce mouvement');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title={`Mouvement de stock — ${article.nom}`} maxWidth={440}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <p className="text-sm" style={{ color: 'var(--color-ink-3)' }}>Stock actuel : <strong style={{ color: 'var(--color-ink)' }}>{article.quantiteStock} {article.unite}</strong></p>

        <div>
          <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--color-ink-2)' }}>Type de mouvement</label>
          <select className="input" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as TypeMouvement })}>
            {Object.entries(TYPE_LABEL).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        </div>

        <input
          required type="number" min={0}
          placeholder={form.type === 'AJUSTEMENT' ? 'Nouveau stock (valeur exacte)' : `Quantité (${article.unite})`}
          className="input" value={form.quantite}
          onChange={(e) => setForm({ ...form, quantite: Number(e.target.value) })}
        />
        <input placeholder="Motif (optionnel)" className="input" value={form.motif} onChange={(e) => setForm({ ...form, motif: e.target.value })} />

        {error && <div className="p-3 rounded-xl text-sm" style={{ background: 'var(--color-danger-soft)', color: 'var(--color-danger)' }}>{error}</div>}

        <button type="submit" disabled={submitting} className="btn btn-primary w-full">{submitting ? 'Enregistrement...' : 'Enregistrer le mouvement'}</button>
      </form>
    </Modal>
  );
}
