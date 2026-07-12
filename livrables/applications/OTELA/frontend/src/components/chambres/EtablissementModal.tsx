'use client';
import { useState } from 'react';
import Modal from '@/components/ui/Modal';
import { useEtablissementsStore } from '@/stores/etablissementsStore';

export default function EtablissementModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { creer } = useEtablissementsStore();
  const [form, setForm] = useState({ nom: '', adresse: '', commune: '', departement: '', htg: true, usd: true });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const devises: ('HTG' | 'USD')[] = [...(form.htg ? ['HTG' as const] : []), ...(form.usd ? ['USD' as const] : [])];
    if (devises.length === 0) { setError('Sélectionnez au moins une devise'); return; }
    setSubmitting(true);
    try {
      await creer({ nom: form.nom, adresse: form.adresse, commune: form.commune, departement: form.departement, devisesAcceptees: devises });
      onClose();
      setForm({ nom: '', adresse: '', commune: '', departement: '', htg: true, usd: true });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Impossible de créer l\'établissement');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Nouvel établissement" maxWidth={480}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input required placeholder="Nom de l'établissement" className="input" value={form.nom} onChange={(e) => setForm({ ...form, nom: e.target.value })} />
        <input required placeholder="Adresse" className="input" value={form.adresse} onChange={(e) => setForm({ ...form, adresse: e.target.value })} />
        <div className="grid grid-cols-2 gap-3">
          <input required placeholder="Commune" className="input" value={form.commune} onChange={(e) => setForm({ ...form, commune: e.target.value })} />
          <input required placeholder="Département" className="input" value={form.departement} onChange={(e) => setForm({ ...form, departement: e.target.value })} />
        </div>
        <div>
          <label className="block text-xs font-semibold mb-2" style={{ color: 'var(--color-ink-2)' }}>Devises acceptées</label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 text-sm" style={{ color: 'var(--color-ink-2)' }}>
              <input type="checkbox" checked={form.htg} onChange={(e) => setForm({ ...form, htg: e.target.checked })} /> HTG
            </label>
            <label className="flex items-center gap-2 text-sm" style={{ color: 'var(--color-ink-2)' }}>
              <input type="checkbox" checked={form.usd} onChange={(e) => setForm({ ...form, usd: e.target.checked })} /> USD
            </label>
          </div>
        </div>
        {error && <div className="p-3 rounded-xl text-sm" style={{ background: 'var(--color-danger-soft)', color: 'var(--color-danger)' }}>{error}</div>}
        <button type="submit" disabled={submitting} className="btn btn-primary w-full">{submitting ? 'Création...' : 'Créer l\'établissement'}</button>
      </form>
    </Modal>
  );
}
