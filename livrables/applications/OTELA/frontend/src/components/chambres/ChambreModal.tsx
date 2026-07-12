'use client';
import { useState } from 'react';
import Modal from '@/components/ui/Modal';
import { useChambresStore } from '@/stores/chambresStore';

export default function ChambreModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { types, creerChambre } = useChambresStore();
  const [form, setForm] = useState({ typeChambreId: '', numero: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await creerChambre(form);
      onClose();
      setForm({ typeChambreId: '', numero: '' });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Impossible de créer la chambre');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Nouvelle chambre" maxWidth={420}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--color-ink-2)' }}>Type de chambre</label>
          <select required className="input" value={form.typeChambreId} onChange={(e) => setForm({ ...form, typeChambreId: e.target.value })}>
            <option value="">Sélectionner...</option>
            {types.map((t) => <option key={t.id} value={t.id}>{t.nom}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--color-ink-2)' }}>Numéro</label>
          <input required placeholder="Ex. 104" className="input" value={form.numero} onChange={(e) => setForm({ ...form, numero: e.target.value })} />
        </div>
        {error && <div className="p-3 rounded-xl text-sm" style={{ background: 'var(--color-danger-soft)', color: 'var(--color-danger)' }}>{error}</div>}
        <button type="submit" disabled={submitting} className="btn btn-primary w-full">{submitting ? 'Création...' : 'Créer la chambre'}</button>
      </form>
    </Modal>
  );
}
