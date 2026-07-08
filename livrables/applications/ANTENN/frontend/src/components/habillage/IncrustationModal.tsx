'use client';
import { useEffect, useState } from 'react';
import Modal from '@/components/ui/Modal';
import { PositionOverlay } from '@/stores/habillageStore';
import { useSponsorStore } from '@/stores/sponsorStore';
import { useGrilleStore } from '@/stores/grilleStore';
import { useMatchStore } from '@/stores/matchStore';

export default function IncrustationModal({
  open, onClose, onSubmit,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: { creneauId: string | null; matchId: string | null; sponsorId: string; logoUrl: string; position: PositionOverlay; opacite: number; actif: boolean }) => Promise<void>;
}) {
  const { sponsors, fetchSponsors } = useSponsorStore();
  const { creneaux, fetchCreneaux } = useGrilleStore();
  const { matchs, fetchMatchs } = useMatchStore();
  const [cible, setCible] = useState<'creneau' | 'match'>('match');
  const [form, setForm] = useState({ creneauId: '', matchId: '', sponsorId: '', logoUrl: '', position: 'BAS_DROITE' as PositionOverlay, opacite: 0.85 });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      fetchSponsors();
      fetchMatchs();
      fetchCreneaux();
    }
  }, [open, fetchSponsors, fetchMatchs, fetchCreneaux]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await onSubmit({
        creneauId: cible === 'creneau' ? form.creneauId : null,
        matchId: cible === 'match' ? form.matchId : null,
        sponsorId: form.sponsorId,
        logoUrl: form.logoUrl,
        position: form.position,
        opacite: Number(form.opacite),
        actif: true,
      });
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de l\'enregistrement');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Nouvelle incrustation logo" maxWidth={520}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold tracking-widest mb-1.5" style={{ color: 'var(--color-ink-3)' }}>RATTACHÉE À</label>
          <div className="flex gap-2">
            <button type="button" onClick={() => setCible('match')} className="btn flex-1" style={{ background: cible === 'match' ? 'var(--color-primary-soft)' : 'var(--color-surface-2)', color: cible === 'match' ? 'var(--color-primary)' : 'var(--color-ink-2)' }}>Un match</button>
            <button type="button" onClick={() => setCible('creneau')} className="btn flex-1" style={{ background: cible === 'creneau' ? 'var(--color-primary-soft)' : 'var(--color-surface-2)', color: cible === 'creneau' ? 'var(--color-primary)' : 'var(--color-ink-2)' }}>Un créneau</button>
          </div>
        </div>

        {cible === 'match' ? (
          <div>
            <label className="block text-xs font-bold tracking-widest mb-1.5" style={{ color: 'var(--color-ink-3)' }}>MATCH</label>
            <select required className="input" value={form.matchId} onChange={(e) => setForm({ ...form, matchId: e.target.value })}>
              <option value="">Sélectionner...</option>
              {matchs.map((m) => <option key={m.id} value={m.id}>{m.nomEvenement}</option>)}
            </select>
          </div>
        ) : (
          <div>
            <label className="block text-xs font-bold tracking-widest mb-1.5" style={{ color: 'var(--color-ink-3)' }}>CRÉNEAU</label>
            <select required className="input" value={form.creneauId} onChange={(e) => setForm({ ...form, creneauId: e.target.value })}>
              <option value="">Sélectionner...</option>
              {creneaux.map((c) => <option key={c.id} value={c.id}>{new Date(c.dateHeureDebut).toLocaleString('fr-FR')} — {c.contenu?.titre || c.match?.nomEvenement}</option>)}
            </select>
          </div>
        )}

        <div>
          <label className="block text-xs font-bold tracking-widest mb-1.5" style={{ color: 'var(--color-ink-3)' }}>SPONSOR</label>
          <select required className="input" value={form.sponsorId} onChange={(e) => {
            const sponsor = sponsors.find((s) => s.id === e.target.value);
            setForm({ ...form, sponsorId: e.target.value, logoUrl: form.logoUrl || sponsor?.logoUrl || '' });
          }}>
            <option value="">Sélectionner...</option>
            {sponsors.map((s) => <option key={s.id} value={s.id}>{s.nomSponsor}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold tracking-widest mb-1.5" style={{ color: 'var(--color-ink-3)' }}>URL DU LOGO</label>
          <input required type="url" className="input font-mono text-xs" value={form.logoUrl} onChange={(e) => setForm({ ...form, logoUrl: e.target.value })} />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold tracking-widest mb-1.5" style={{ color: 'var(--color-ink-3)' }}>POSITION</label>
            <select className="input" value={form.position} onChange={(e) => setForm({ ...form, position: e.target.value as PositionOverlay })}>
              <option value="HAUT_GAUCHE">Haut gauche</option>
              <option value="HAUT_DROITE">Haut droite</option>
              <option value="BAS_GAUCHE">Bas gauche</option>
              <option value="BAS_DROITE">Bas droite</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold tracking-widest mb-1.5" style={{ color: 'var(--color-ink-3)' }}>OPACITÉ</label>
            <input type="number" min={0} max={1} step={0.05} className="input" value={form.opacite} onChange={(e) => setForm({ ...form, opacite: Number(e.target.value) })} />
          </div>
        </div>

        {error && <div className="p-3 rounded-xl text-sm" style={{ background: 'var(--color-danger-soft)', color: 'var(--color-danger)' }}>{error}</div>}

        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="btn btn-secondary">Annuler</button>
          <button type="submit" disabled={submitting} className="btn btn-primary">Créer</button>
        </div>
      </form>
    </Modal>
  );
}
