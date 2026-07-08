'use client';
import { useEffect, useState } from 'react';
import { Plus, X } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import { BandeauItem } from '@/stores/habillageStore';
import { useSponsorStore } from '@/stores/sponsorStore';
import { useGrilleStore } from '@/stores/grilleStore';
import { useMatchStore } from '@/stores/matchStore';

export default function BandeauModal({
  open, onClose, onSubmit,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: { creneauId: string | null; matchId: string | null; items: BandeauItem[]; vitesseDefilement: number; actif: boolean }) => Promise<void>;
}) {
  const { sponsors, fetchSponsors } = useSponsorStore();
  const { creneaux, fetchCreneaux } = useGrilleStore();
  const { matchs, fetchMatchs } = useMatchStore();
  const [cible, setCible] = useState<'creneau' | 'match'>('match');
  const [creneauId, setCreneauId] = useState('');
  const [matchId, setMatchId] = useState('');
  const [items, setItems] = useState<BandeauItem[]>([{ texte: '' }]);
  const [vitesse, setVitesse] = useState(60);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      fetchSponsors();
      fetchMatchs();
      fetchCreneaux();
      setItems([{ texte: '' }]);
      setError('');
    }
  }, [open, fetchSponsors, fetchMatchs, fetchCreneaux]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const validItems = items.filter((i) => i.texte.trim());
    if (validItems.length === 0) { setError('Au moins un élément de bandeau requis'); return; }
    setSubmitting(true);
    try {
      await onSubmit({
        creneauId: cible === 'creneau' ? creneauId : null,
        matchId: cible === 'match' ? matchId : null,
        items: validItems,
        vitesseDefilement: vitesse,
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
    <Modal open={open} onClose={onClose} title="Nouveau bandeau déroulant" maxWidth={560}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold tracking-widest mb-1.5" style={{ color: 'var(--color-ink-3)' }}>RATTACHÉ À</label>
          <div className="flex gap-2">
            <button type="button" onClick={() => setCible('match')} className="btn flex-1" style={{ background: cible === 'match' ? 'var(--color-primary-soft)' : 'var(--color-surface-2)', color: cible === 'match' ? 'var(--color-primary)' : 'var(--color-ink-2)' }}>Un match</button>
            <button type="button" onClick={() => setCible('creneau')} className="btn flex-1" style={{ background: cible === 'creneau' ? 'var(--color-primary-soft)' : 'var(--color-surface-2)', color: cible === 'creneau' ? 'var(--color-primary)' : 'var(--color-ink-2)' }}>Un créneau</button>
          </div>
        </div>

        {cible === 'match' ? (
          <select required className="input" value={matchId} onChange={(e) => setMatchId(e.target.value)}>
            <option value="">Sélectionner un match...</option>
            {matchs.map((m) => <option key={m.id} value={m.id}>{m.nomEvenement}</option>)}
          </select>
        ) : (
          <select required className="input" value={creneauId} onChange={(e) => setCreneauId(e.target.value)}>
            <option value="">Sélectionner un créneau...</option>
            {creneaux.map((c) => <option key={c.id} value={c.id}>{new Date(c.dateHeureDebut).toLocaleString('fr-FR')} — {c.contenu?.titre || c.match?.nomEvenement}</option>)}
          </select>
        )}

        <div>
          <label className="block text-xs font-bold tracking-widest mb-1.5" style={{ color: 'var(--color-ink-3)' }}>ÉLÉMENTS DU BANDEAU</label>
          <div className="space-y-2">
            {items.map((item, i) => (
              <div key={i} className="flex gap-2">
                <input
                  className="input flex-1"
                  placeholder="Texte du sponsor..."
                  value={item.texte}
                  onChange={(e) => setItems(items.map((it, idx) => idx === i ? { ...it, texte: e.target.value } : it))}
                />
                <select
                  className="input w-40"
                  value={item.sponsorId || ''}
                  onChange={(e) => setItems(items.map((it, idx) => idx === i ? { ...it, sponsorId: e.target.value || undefined } : it))}
                >
                  <option value="">Sponsor...</option>
                  {sponsors.map((s) => <option key={s.id} value={s.id}>{s.nomSponsor}</option>)}
                </select>
                {items.length > 1 && (
                  <button type="button" onClick={() => setItems(items.filter((_, idx) => idx !== i))} className="p-2 rounded-lg" style={{ color: 'var(--color-danger)' }}>
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
          <button type="button" onClick={() => setItems([...items, { texte: '' }])} className="text-xs mt-2 flex items-center gap-1 font-semibold" style={{ color: 'var(--color-primary)' }}>
            <Plus className="w-3.5 h-3.5" /> Ajouter un élément
          </button>
        </div>

        <div>
          <label className="block text-xs font-bold tracking-widest mb-1.5" style={{ color: 'var(--color-ink-3)' }}>VITESSE DE DÉFILEMENT</label>
          <input type="number" min={10} max={300} className="input" value={vitesse} onChange={(e) => setVitesse(Number(e.target.value))} />
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
