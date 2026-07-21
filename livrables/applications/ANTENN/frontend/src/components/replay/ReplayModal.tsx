'use client';
import { useEffect, useState } from 'react';
import Modal from '@/components/ui/Modal';
import { Replay, ReplayInput } from '@/stores/replayStore';

// L'API attend des dates ISO complètes (Zod .datetime()) ; l'input HTML travaille en
// heure locale sans fuseau — conversion dans les deux sens ici.
function versInputLocal(iso: string | null) {
  if (!iso) return '';
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
function versIso(valeur: string) {
  return valeur ? new Date(valeur).toISOString() : null;
}

export default function ReplayModal({
  open, onClose, onSubmit, replay,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: ReplayInput) => Promise<void>;
  replay?: Replay | null;
}) {
  const [form, setForm] = useState({ titre: '', description: '', urlVod: '', dureeSecondes: 0, disponibleDu: '', disponibleAu: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (replay) {
      setForm({
        titre: replay.titre,
        description: replay.description || '',
        urlVod: replay.urlVod,
        dureeSecondes: replay.dureeSecondes,
        disponibleDu: versInputLocal(replay.disponibleDu),
        disponibleAu: versInputLocal(replay.disponibleAu),
      });
    } else {
      setForm({ titre: '', description: '', urlVod: '', dureeSecondes: 0, disponibleDu: '', disponibleAu: '' });
    }
    setError('');
  }, [replay, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await onSubmit({
        titre: form.titre,
        description: form.description || null,
        urlVod: form.urlVod,
        dureeSecondes: Number(form.dureeSecondes),
        disponibleDu: versIso(form.disponibleDu),
        disponibleAu: versIso(form.disponibleAu),
      });
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de l\'enregistrement');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title={replay ? 'Modifier le replay' : 'Nouveau replay'} maxWidth={540}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold tracking-widest mb-1.5" style={{ color: 'var(--color-ink-3)' }}>TITRE</label>
          <input required className="input" value={form.titre} onChange={(e) => setForm({ ...form, titre: e.target.value })} />
        </div>
        <div>
          <label className="block text-xs font-bold tracking-widest mb-1.5" style={{ color: 'var(--color-ink-3)' }}>DESCRIPTION</label>
          <textarea className="input" rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        </div>
        <div>
          <label className="block text-xs font-bold tracking-widest mb-1.5" style={{ color: 'var(--color-ink-3)' }}>URL DE L&apos;ENREGISTREMENT (VOD)</label>
          <input required type="url" className="input font-mono text-xs" value={form.urlVod} onChange={(e) => setForm({ ...form, urlVod: e.target.value })} placeholder="https://cdn.example.com/replay/....m3u8" />
          <p className="text-[11px] mt-1" style={{ color: 'var(--color-ink-3)' }}>
            Fichier déjà hébergé (CDN, ou enregistrement du serveur RTMP pour un match).
          </p>
        </div>
        <div>
          <label className="block text-xs font-bold tracking-widest mb-1.5" style={{ color: 'var(--color-ink-3)' }}>DURÉE (SECONDES)</label>
          <input required type="number" min={0} className="input" value={form.dureeSecondes} onChange={(e) => setForm({ ...form, dureeSecondes: Number(e.target.value) })} />
        </div>

        <div className="p-3 rounded-xl space-y-3" style={{ background: 'var(--color-surface-2)' }}>
          <p className="text-xs font-bold tracking-widest" style={{ color: 'var(--color-ink-3)' }}>FENÊTRE DE DROITS (OPTIONNELLE)</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold mb-1" style={{ color: 'var(--color-ink-3)' }}>Disponible à partir du</label>
              <input type="datetime-local" className="input" value={form.disponibleDu} onChange={(e) => setForm({ ...form, disponibleDu: e.target.value })} />
            </div>
            <div>
              <label className="block text-[11px] font-semibold mb-1" style={{ color: 'var(--color-ink-3)' }}>Jusqu&apos;au</label>
              <input type="datetime-local" className="input" value={form.disponibleAu} onChange={(e) => setForm({ ...form, disponibleAu: e.target.value })} />
            </div>
          </div>
          <p className="text-[11px]" style={{ color: 'var(--color-ink-3)' }}>
            Hors de cette fenêtre, le replay disparaît du catalogue public automatiquement.
          </p>
        </div>

        {error && <div className="p-3 rounded-xl text-sm" style={{ background: 'var(--color-danger-soft)', color: 'var(--color-danger)' }}>{error}</div>}

        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="btn btn-secondary">Annuler</button>
          <button type="submit" disabled={submitting} className="btn btn-primary">{replay ? 'Enregistrer' : 'Créer'}</button>
        </div>
      </form>
    </Modal>
  );
}
