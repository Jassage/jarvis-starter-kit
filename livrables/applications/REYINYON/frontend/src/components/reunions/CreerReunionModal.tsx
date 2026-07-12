'use client';
import { useState } from 'react';
import Modal from '@/components/ui/Modal';
import { creerReunion } from '@/lib/reunions';

export default function CreerReunionModal({ open, onClose, onCreated }: { open: boolean; onClose: () => void; onCreated: () => void }) {
  const [titre, setTitre] = useState('');
  const [codeAcces, setCodeAcces] = useState('');
  const [salleAttenteActive, setSalleAttenteActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await creerReunion({ titre, codeAcces: codeAcces || undefined, salleAttenteActive });
      setTitre('');
      setCodeAcces('');
      setSalleAttenteActive(false);
      onCreated();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Impossible de créer la réunion');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Nouvelle réunion">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold mb-1.5" style={{ color: 'var(--color-ink-2)' }}>Titre</label>
          <input required className="input" value={titre} onChange={(e) => setTitre(e.target.value)} placeholder="Réunion d'équipe" />
        </div>
        <div>
          <label className="block text-xs font-bold mb-1.5" style={{ color: 'var(--color-ink-2)' }}>Code d&apos;accès (optionnel)</label>
          <input className="input" value={codeAcces} onChange={(e) => setCodeAcces(e.target.value)} placeholder="Laisser vide pour aucun" />
        </div>
        <label className="flex items-center gap-2.5 text-sm font-medium" style={{ color: 'var(--color-ink-2)' }}>
          <input type="checkbox" checked={salleAttenteActive} onChange={(e) => setSalleAttenteActive(e.target.checked)} />
          Activer la salle d&apos;attente (j&apos;admets chaque participant manuellement)
        </label>
        {error && <p className="text-sm" style={{ color: 'var(--color-danger)' }}>{error}</p>}
        <button type="submit" disabled={loading} className="btn btn-mint w-full">{loading ? 'Création...' : 'Créer la réunion'}</button>
      </form>
    </Modal>
  );
}
