'use client';
import { useState } from 'react';
import Modal from '@/components/ui/Modal';
import { Creneau } from '@/stores/grilleStore';

function toLocalInput(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function DupliquerModal({
  open, onClose, onSubmit, creneau,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (dateHeureDebut: string) => Promise<void>;
  creneau: Creneau | null;
}) {
  const [dateHeureDebut, setDateHeureDebut] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!creneau) return null;

  const handleOpen = () => {
    if (!dateHeureDebut) {
      const debut = new Date(creneau.dateHeureDebut);
      debut.setDate(debut.getDate() + 1);
      setDateHeureDebut(toLocalInput(debut.toISOString()));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await onSubmit(new Date(dateHeureDebut).toISOString());
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la duplication');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Dupliquer le créneau" maxWidth={420}>
      <div onMouseEnter={handleOpen} />
      <form onSubmit={handleSubmit} className="space-y-4">
        <p className="text-sm" style={{ color: 'var(--color-ink-2)' }}>
          Nouvelle occurrence de « {creneau.contenu?.titre || creneau.match?.nomEvenement} », même durée, à partir de :
        </p>
        <input
          type="datetime-local"
          required
          className="input"
          value={dateHeureDebut || toLocalInput(new Date(new Date(creneau.dateHeureDebut).getTime() + 24 * 60 * 60 * 1000).toISOString())}
          onChange={(e) => setDateHeureDebut(e.target.value)}
        />
        {error && <div className="p-3 rounded-xl text-sm" style={{ background: 'var(--color-danger-soft)', color: 'var(--color-danger)' }}>{error}</div>}
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="btn btn-secondary">Annuler</button>
          <button type="submit" disabled={submitting} className="btn btn-primary">Dupliquer</button>
        </div>
      </form>
    </Modal>
  );
}
