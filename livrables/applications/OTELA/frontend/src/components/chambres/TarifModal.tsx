'use client';
import { useState } from 'react';
import Modal from '@/components/ui/Modal';
import { useChambresStore } from '@/stores/chambresStore';
import type { TypeSejour } from '@/stores/chambresStore';

const AUJOURDHUI = new Date().toISOString().slice(0, 10);
const DANS_UN_AN = new Date(Date.now() + 365 * 86400000).toISOString().slice(0, 10);

export default function TarifModal({ open, onClose, typeChambreId }: { open: boolean; onClose: () => void; typeChambreId: string }) {
  const { creerTarif } = useChambresStore();
  const [form, setForm] = useState({
    typeSejour: 'NUITEE' as TypeSejour,
    devise: 'HTG' as 'HTG' | 'USD',
    montant: '',
    dateDebutSaison: AUJOURDHUI,
    dateFinSaison: DANS_UN_AN,
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await creerTarif(typeChambreId, {
        devise: form.devise,
        typeSejour: form.typeSejour,
        montant: Number(form.montant),
        dateDebutSaison: form.dateDebutSaison,
        dateFinSaison: form.dateFinSaison,
      });
      onClose();
      setForm({ typeSejour: 'NUITEE', devise: 'HTG', montant: '', dateDebutSaison: AUJOURDHUI, dateFinSaison: DANS_UN_AN });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Impossible de créer le tarif');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Nouveau tarif" maxWidth={420}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--color-ink-2)' }}>Type de séjour</label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setForm({ ...form, typeSejour: 'NUITEE' })}
              className={form.typeSejour === 'NUITEE' ? 'btn btn-primary' : 'btn btn-secondary'}
            >
              Nuitée
            </button>
            <button
              type="button"
              onClick={() => setForm({ ...form, typeSejour: 'JOUR' })}
              className={form.typeSejour === 'JOUR' ? 'btn btn-primary' : 'btn btn-secondary'}
            >
              Day-use (jour)
            </button>
          </div>
        </div>
        <div>
          <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--color-ink-2)' }}>Devise</label>
          <select className="input" value={form.devise} onChange={(e) => setForm({ ...form, devise: e.target.value as 'HTG' | 'USD' })}>
            <option value="HTG">HTG</option>
            <option value="USD">USD</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--color-ink-2)' }}>
            Montant {form.typeSejour === 'JOUR' ? '(forfaitaire / séjour)' : '(/ nuit)'}
          </label>
          <input type="number" min={0} required className="input" value={form.montant} onChange={(e) => setForm({ ...form, montant: e.target.value })} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--color-ink-2)' }}>Début saison</label>
            <input type="date" required className="input" value={form.dateDebutSaison} onChange={(e) => setForm({ ...form, dateDebutSaison: e.target.value })} />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--color-ink-2)' }}>Fin saison</label>
            <input type="date" required className="input" value={form.dateFinSaison} onChange={(e) => setForm({ ...form, dateFinSaison: e.target.value })} />
          </div>
        </div>
        {error && <div className="p-3 rounded-xl text-sm" style={{ background: 'var(--color-danger-soft)', color: 'var(--color-danger)' }}>{error}</div>}
        <button type="submit" disabled={submitting} className="btn btn-primary w-full">{submitting ? 'Création...' : 'Créer le tarif'}</button>
      </form>
    </Modal>
  );
}
