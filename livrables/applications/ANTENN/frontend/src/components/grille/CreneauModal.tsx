'use client';
import { useEffect, useState } from 'react';
import Modal from '@/components/ui/Modal';
import { Creneau, CreneauInput, TypeCreneau } from '@/stores/grilleStore';
import { useContenuStore } from '@/stores/contenuStore';
import { useMatchStore } from '@/stores/matchStore';

function toLocalInput(iso?: string): string {
  if (!iso) return '';
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function CreneauModal({
  open, onClose, onSubmit, creneau, defaultDebut,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CreneauInput) => Promise<void>;
  creneau?: Creneau | null;
  defaultDebut?: string;
}) {
  const { contenus, fetchContenus } = useContenuStore();
  const { matchs, fetchMatchs } = useMatchStore();
  const [form, setForm] = useState({
    dateHeureDebut: '',
    dateHeureFin: '',
    typeCreneau: 'PROGRAMME' as TypeCreneau,
    contenuId: '',
    matchId: '',
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      fetchContenus();
      fetchMatchs();
    }
  }, [open, fetchContenus, fetchMatchs]);

  useEffect(() => {
    if (creneau) {
      setForm({
        dateHeureDebut: toLocalInput(creneau.dateHeureDebut),
        dateHeureFin: toLocalInput(creneau.dateHeureFin),
        typeCreneau: creneau.typeCreneau,
        contenuId: creneau.contenuId || '',
        matchId: creneau.matchId || '',
      });
    } else {
      setForm({
        dateHeureDebut: toLocalInput(defaultDebut) || toLocalInput(new Date().toISOString()),
        dateHeureFin: '',
        typeCreneau: 'PROGRAMME',
        contenuId: '',
        matchId: '',
      });
    }
    setError('');
  }, [creneau, defaultDebut, open]);

  const isDirect = form.typeCreneau === 'MATCH_DIRECT';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await onSubmit({
        dateHeureDebut: new Date(form.dateHeureDebut).toISOString(),
        dateHeureFin: new Date(form.dateHeureFin).toISOString(),
        typeCreneau: form.typeCreneau,
        contenuId: isDirect ? null : (form.contenuId || null),
        matchId: isDirect ? (form.matchId || null) : null,
      });
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de l\'enregistrement');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title={creneau ? 'Modifier le créneau' : 'Nouveau créneau'} maxWidth={520}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold tracking-widest mb-1.5" style={{ color: 'var(--color-ink-3)' }}>DÉBUT</label>
            <input type="datetime-local" required className="input" value={form.dateHeureDebut} onChange={(e) => setForm({ ...form, dateHeureDebut: e.target.value })} />
          </div>
          <div>
            <label className="block text-xs font-bold tracking-widest mb-1.5" style={{ color: 'var(--color-ink-3)' }}>FIN</label>
            <input type="datetime-local" required className="input" value={form.dateHeureFin} onChange={(e) => setForm({ ...form, dateHeureFin: e.target.value })} />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold tracking-widest mb-1.5" style={{ color: 'var(--color-ink-3)' }}>TYPE DE CRÉNEAU</label>
          <select className="input" value={form.typeCreneau} onChange={(e) => setForm({ ...form, typeCreneau: e.target.value as TypeCreneau })}>
            <option value="PROGRAMME">Programme (boucle)</option>
            <option value="MATCH_DIRECT">Match en direct</option>
            <option value="PUB">Coupure publicitaire</option>
          </select>
        </div>

        {isDirect ? (
          <div>
            <label className="block text-xs font-bold tracking-widest mb-1.5" style={{ color: 'var(--color-ink-3)' }}>MATCH</label>
            <select required className="input" value={form.matchId} onChange={(e) => setForm({ ...form, matchId: e.target.value })}>
              <option value="">Sélectionner un match...</option>
              {matchs.map((m) => (
                <option key={m.id} value={m.id}>{m.nomEvenement} — {m.equipes}</option>
              ))}
            </select>
          </div>
        ) : (
          <div>
            <label className="block text-xs font-bold tracking-widest mb-1.5" style={{ color: 'var(--color-ink-3)' }}>CONTENU</label>
            <select required className="input" value={form.contenuId} onChange={(e) => setForm({ ...form, contenuId: e.target.value })}>
              <option value="">Sélectionner un contenu...</option>
              {contenus.map((c) => (
                <option key={c.id} value={c.id}>{c.titre} ({c.typeContenu})</option>
              ))}
            </select>
          </div>
        )}

        {error && (
          <div className="p-3 rounded-xl text-sm" style={{ background: 'var(--color-danger-soft)', color: 'var(--color-danger)' }}>{error}</div>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="btn btn-secondary">Annuler</button>
          <button type="submit" disabled={submitting} className="btn btn-primary">{creneau ? 'Enregistrer' : 'Créer'}</button>
        </div>
      </form>
    </Modal>
  );
}
