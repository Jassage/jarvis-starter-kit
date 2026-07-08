'use client';
import { useEffect, useState } from 'react';
import Modal from '@/components/ui/Modal';
import { Match, MatchInput } from '@/stores/matchStore';
import { useSponsorStore } from '@/stores/sponsorStore';

function toLocalInput(iso?: string): string {
  if (!iso) return '';
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function MatchModal({
  open, onClose, onSubmit, match,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: MatchInput) => Promise<void>;
  match?: Match | null;
}) {
  const { sponsors, fetchSponsors } = useSponsorStore();
  const [form, setForm] = useState({ nomEvenement: '', equipes: '', dateHeurePrevue: '', ingestUrlRtmp: '', sponsorPrincipalId: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) fetchSponsors();
  }, [open, fetchSponsors]);

  useEffect(() => {
    if (match) {
      setForm({
        nomEvenement: match.nomEvenement,
        equipes: match.equipes,
        dateHeurePrevue: toLocalInput(match.dateHeurePrevue),
        ingestUrlRtmp: match.ingestUrlRtmp || '',
        sponsorPrincipalId: match.sponsorPrincipalId || '',
      });
    } else {
      setForm({ nomEvenement: '', equipes: '', dateHeurePrevue: '', ingestUrlRtmp: '', sponsorPrincipalId: '' });
    }
    setError('');
  }, [match, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await onSubmit({
        nomEvenement: form.nomEvenement,
        equipes: form.equipes,
        dateHeurePrevue: new Date(form.dateHeurePrevue).toISOString(),
        ingestUrlRtmp: form.ingestUrlRtmp || null,
        sponsorPrincipalId: form.sponsorPrincipalId || null,
      });
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de l\'enregistrement');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title={match ? 'Modifier le match' : 'Nouveau match'} maxWidth={520}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold tracking-widest mb-1.5" style={{ color: 'var(--color-ink-3)' }}>NOM DE L'ÉVÉNEMENT</label>
          <input required className="input" value={form.nomEvenement} onChange={(e) => setForm({ ...form, nomEvenement: e.target.value })} placeholder="Championnat D1 — Journée 12" />
        </div>
        <div>
          <label className="block text-xs font-bold tracking-widest mb-1.5" style={{ color: 'var(--color-ink-3)' }}>ÉQUIPES</label>
          <input required className="input" value={form.equipes} onChange={(e) => setForm({ ...form, equipes: e.target.value })} placeholder="Violette AC vs Racing Club Haïtien" />
        </div>
        <div>
          <label className="block text-xs font-bold tracking-widest mb-1.5" style={{ color: 'var(--color-ink-3)' }}>DATE/HEURE PRÉVUE</label>
          <input type="datetime-local" required className="input" value={form.dateHeurePrevue} onChange={(e) => setForm({ ...form, dateHeurePrevue: e.target.value })} />
        </div>
        <div>
          <label className="block text-xs font-bold tracking-widest mb-1.5" style={{ color: 'var(--color-ink-3)' }}>URL D'INGEST RTMP</label>
          <input className="input font-mono text-xs" value={form.ingestUrlRtmp} onChange={(e) => setForm({ ...form, ingestUrlRtmp: e.target.value })} placeholder="rtmp://ingest.example.com/live/xxx" />
        </div>
        <div>
          <label className="block text-xs font-bold tracking-widest mb-1.5" style={{ color: 'var(--color-ink-3)' }}>SPONSOR TITRE</label>
          <select className="input" value={form.sponsorPrincipalId} onChange={(e) => setForm({ ...form, sponsorPrincipalId: e.target.value })}>
            <option value="">Aucun</option>
            {sponsors.map((s) => (
              <option key={s.id} value={s.id}>{s.nomSponsor}</option>
            ))}
          </select>
        </div>

        {error && <div className="p-3 rounded-xl text-sm" style={{ background: 'var(--color-danger-soft)', color: 'var(--color-danger)' }}>{error}</div>}

        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="btn btn-secondary">Annuler</button>
          <button type="submit" disabled={submitting} className="btn btn-primary">{match ? 'Enregistrer' : 'Créer'}</button>
        </div>
      </form>
    </Modal>
  );
}
