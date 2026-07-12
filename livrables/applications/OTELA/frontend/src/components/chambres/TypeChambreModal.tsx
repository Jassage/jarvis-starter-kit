'use client';
import { useState } from 'react';
import Modal from '@/components/ui/Modal';
import { useChambresStore } from '@/stores/chambresStore';

const AUJOURDHUI = new Date().toISOString().slice(0, 10);
const DANS_UN_AN = new Date(Date.now() + 365 * 86400000).toISOString().slice(0, 10);

export default function TypeChambreModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { creerType, creerTarif } = useChambresStore();
  const [form, setForm] = useState({ nom: '', capaciteMax: 2, description: '', tarifHtg: '', tarifUsd: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await creerType({ nom: form.nom, capaciteMax: form.capaciteMax, description: form.description || undefined });
      const { types } = useChambresStore.getState();
      const nouveauType = types.find((t) => t.nom === form.nom && t.capaciteMax === form.capaciteMax);
      if (nouveauType) {
        if (form.tarifHtg) await creerTarif(nouveauType.id, { devise: 'HTG', typeSejour: 'NUITEE', montant: Number(form.tarifHtg), dateDebutSaison: AUJOURDHUI, dateFinSaison: DANS_UN_AN });
        if (form.tarifUsd) await creerTarif(nouveauType.id, { devise: 'USD', typeSejour: 'NUITEE', montant: Number(form.tarifUsd), dateDebutSaison: AUJOURDHUI, dateFinSaison: DANS_UN_AN });
      }
      onClose();
      setForm({ nom: '', capaciteMax: 2, description: '', tarifHtg: '', tarifUsd: '' });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Impossible de créer le type de chambre');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Nouveau type de chambre" maxWidth={480}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--color-ink-2)' }}>Nom</label>
          <input required placeholder="Ex. Suite" className="input" value={form.nom} onChange={(e) => setForm({ ...form, nom: e.target.value })} />
        </div>
        <div>
          <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--color-ink-2)' }}>Capacité maximale</label>
          <input type="number" min={1} max={50} required className="input" value={form.capaciteMax} onChange={(e) => setForm({ ...form, capaciteMax: Number(e.target.value) })} />
        </div>
        <div>
          <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--color-ink-2)' }}>Description</label>
          <textarea className="input" rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        </div>
        <div className="pt-2 border-t" style={{ borderColor: 'var(--color-line)' }}>
          <p className="text-xs font-bold tracking-widest mb-3" style={{ color: 'var(--color-ink-3)' }}>TARIF INITIAL (optionnel, sur 1 an)</p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--color-ink-2)' }}>Tarif / nuit (HTG)</label>
              <input type="number" min={0} className="input" value={form.tarifHtg} onChange={(e) => setForm({ ...form, tarifHtg: e.target.value })} />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--color-ink-2)' }}>Tarif / nuit (USD)</label>
              <input type="number" min={0} className="input" value={form.tarifUsd} onChange={(e) => setForm({ ...form, tarifUsd: e.target.value })} />
            </div>
          </div>
        </div>
        {error && <div className="p-3 rounded-xl text-sm" style={{ background: 'var(--color-danger-soft)', color: 'var(--color-danger)' }}>{error}</div>}
        <button type="submit" disabled={submitting} className="btn btn-primary w-full">{submitting ? 'Création...' : 'Créer le type de chambre'}</button>
      </form>
    </Modal>
  );
}
