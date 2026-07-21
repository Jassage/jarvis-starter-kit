'use client';
import { useEffect, useState } from 'react';
import { Trophy, Film, Radio } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import Badge from '@/components/ui/Badge';
import { CreneauReplayable, ReplayInput, useReplayStore } from '@/stores/replayStore';

// Publication d'un replay depuis la grille : seuls les créneaux réellement passés à
// l'antenne (synchronisés et terminés) sont proposés — la liste vient du backend.
export default function DepuisCreneauModal({
  open, onClose, onSubmit,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (creneauId: string, data: Partial<ReplayInput>) => Promise<void>;
}) {
  const { creneauxReplayables, fetchCreneauxReplayables } = useReplayStore();
  const [selection, setSelection] = useState<CreneauReplayable | null>(null);
  const [urlVod, setUrlVod] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      fetchCreneauxReplayables().catch(() => {});
      setSelection(null);
      setUrlVod('');
      setError('');
    }
  }, [open, fetchCreneauxReplayables]);

  // Un match direct n'a aucun fichier associé : son URL d'enregistrement doit être
  // saisie. Un programme reprend par défaut le fichier de son contenu.
  const urlRequise = !!selection && !selection.contenu?.urlFichier;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selection) return;
    setError('');
    setSubmitting(true);
    try {
      await onSubmit(selection.id, urlVod ? { urlVod } : {});
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la publication');
    } finally {
      setSubmitting(false);
    }
  };

  const label = (c: CreneauReplayable) =>
    c.match ? `${c.match.nomEvenement} — ${c.match.equipes}` : c.contenu?.titre || 'Programme';

  return (
    <Modal open={open} onClose={onClose} title="Publier depuis la grille" maxWidth={600}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <p className="text-xs" style={{ color: 'var(--color-ink-3)' }}>
          Choisissez un programme déjà diffusé. Le replay est créé en brouillon : il ne
          devient public qu&apos;une fois publié.
        </p>

        <div className="space-y-2 max-h-72 overflow-y-auto">
          {creneauxReplayables.length === 0 && (
            <div className="p-6 text-center text-sm" style={{ color: 'var(--color-ink-3)' }}>
              Aucun créneau diffusé disponible. Un créneau doit être synchronisé et terminé
              pour pouvoir être publié en replay.
            </div>
          )}
          {creneauxReplayables.map((c) => {
            const actif = selection?.id === c.id;
            return (
              <button
                type="button"
                key={c.id}
                onClick={() => { setSelection(c); setUrlVod(''); setError(''); }}
                className="w-full text-left p-3 rounded-xl flex items-center gap-3 transition-colors"
                style={{
                  background: actif ? 'var(--color-primary-soft)' : 'var(--color-surface-2)',
                  border: `1px solid ${actif ? 'var(--color-primary)' : 'transparent'}`,
                }}
              >
                {c.match ? <Trophy className="w-4 h-4 shrink-0" style={{ color: 'var(--color-live)' }} /> : <Film className="w-4 h-4 shrink-0" style={{ color: 'var(--color-ink-3)' }} />}
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold truncate" style={{ color: 'var(--color-ink)' }}>{label(c)}</p>
                  <p className="text-[11px] font-mono" style={{ color: 'var(--color-ink-3)' }}>
                    {new Date(c.dateHeureDebut).toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                    {' → '}
                    {new Date(c.dateHeureFin).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                {!c.contenu?.urlFichier && <Badge tone="warning"><Radio className="w-3 h-3" /> URL requise</Badge>}
              </button>
            );
          })}
        </div>

        {selection && (
          <div>
            <label className="block text-xs font-bold tracking-widest mb-1.5" style={{ color: 'var(--color-ink-3)' }}>
              URL DE L&apos;ENREGISTREMENT {urlRequise ? '(REQUISE)' : '(OPTIONNELLE)'}
            </label>
            <input
              type="url"
              required={urlRequise}
              className="input font-mono text-xs"
              value={urlVod}
              onChange={(e) => setUrlVod(e.target.value)}
              placeholder={selection.contenu?.urlFichier || 'https://cdn.example.com/replay/....m3u8'}
            />
            <p className="text-[11px] mt-1" style={{ color: 'var(--color-ink-3)' }}>
              {urlRequise
                ? 'Ce créneau est un direct : aucun fichier n\'existe, saisissez l\'URL de l\'enregistrement produit par le serveur de streaming.'
                : 'Laissez vide pour réutiliser le fichier du contenu diffusé.'}
            </p>
          </div>
        )}

        {error && <div className="p-3 rounded-xl text-sm" style={{ background: 'var(--color-danger-soft)', color: 'var(--color-danger)' }}>{error}</div>}

        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="btn btn-secondary">Annuler</button>
          <button type="submit" disabled={!selection || submitting} className="btn btn-primary">Créer le replay</button>
        </div>
      </form>
    </Modal>
  );
}
