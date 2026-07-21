'use client';
import { useEffect, useRef, useState } from 'react';
import { History, Pencil, Trash2, Upload, Eye, Send, EyeOff, CalendarClock, Trophy } from 'lucide-react';
import { useReplayStore, Replay } from '@/stores/replayStore';
import Badge, { BadgeTone } from '@/components/ui/Badge';
import EmptyState from '@/components/ui/EmptyState';
import ReplayModal from '@/components/replay/ReplayModal';
import DepuisCreneauModal from '@/components/replay/DepuisCreneauModal';

const STATUT: Record<string, { label: string; tone: BadgeTone }> = {
  BROUILLON: { label: 'Brouillon', tone: 'warning' },
  PUBLIE: { label: 'Publié', tone: 'success' },
  RETIRE: { label: 'Retiré', tone: 'neutral' },
};

function formatDuree(s: number) {
  const h = Math.floor(s / 3600);
  const m = Math.round((s % 3600) / 60);
  return h > 0 ? `${h}h${String(m).padStart(2, '0')}` : `${m}min`;
}

function formatFenetre(du: string | null, au: string | null) {
  const f = (v: string) => new Date(v).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: '2-digit' });
  if (!du && !au) return 'Sans limite';
  if (du && au) return `${f(du)} → ${f(au)}`;
  return du ? `À partir du ${f(du)}` : `Jusqu'au ${f(au!)}`;
}

// Une fenêtre close n'empêche pas le replay d'exister côté régie, mais il n'est plus
// servi publiquement : on le signale explicitement pour éviter le faux "Publié".
function fenetreExpiree(r: Replay) {
  return !!r.disponibleAu && new Date(r.disponibleAu) <= new Date();
}

export default function ReplayPage() {
  const { replays, isLoading, fetchReplays, createReplay, createDepuisCreneau, updateReplay, uploadVignette, publier, retirer, deleteReplay } = useReplayStore();
  const [modalOpen, setModalOpen] = useState(false);
  const [depuisCreneauOpen, setDepuisCreneauOpen] = useState(false);
  const [editing, setEditing] = useState<Replay | null>(null);
  const [erreur, setErreur] = useState('');
  const fileInput = useRef<HTMLInputElement>(null);
  const cibleVignette = useRef<string | null>(null);

  useEffect(() => {
    fetchReplays();
  }, [fetchReplays]);

  const action = async (fn: () => Promise<void>) => {
    setErreur('');
    try {
      await fn();
    } catch (err: any) {
      setErreur(err.response?.data?.message || 'Action impossible');
    }
  };

  const handleDelete = (r: Replay) => {
    if (!confirm(`Supprimer le replay "${r.titre}" ?`)) return;
    action(() => deleteReplay(r.id));
  };

  const declencherUpload = (id: string) => {
    cibleVignette.current = id;
    fileInput.current?.click();
  };

  const handleFichier = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fichier = e.target.files?.[0];
    const id = cibleVignette.current;
    e.target.value = '';
    if (!fichier || !id) return;
    action(() => uploadVignette(id, fichier));
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <p className="text-sm font-semibold" style={{ color: 'var(--color-ink)' }}>Catalogue replay</p>
          <p className="text-xs" style={{ color: 'var(--color-ink-3)' }}>
            Les programmes déjà passés à l&apos;antenne, remis à disposition en rattrapage.
          </p>
        </div>
        <div className="flex gap-2 shrink-0">
          <button onClick={() => setDepuisCreneauOpen(true)} className="btn btn-secondary">
            <CalendarClock className="w-4 h-4" /> Publier depuis la grille
          </button>
          <button onClick={() => { setEditing(null); setModalOpen(true); }} className="btn btn-primary">
            Nouveau replay
          </button>
        </div>
      </div>

      {erreur && <div className="p-3 rounded-xl text-sm" style={{ background: 'var(--color-danger-soft)', color: 'var(--color-danger)' }}>{erreur}</div>}

      <div className="card overflow-x-auto">
        {isLoading ? (
          <div className="py-14 text-center text-sm" style={{ color: 'var(--color-ink-3)' }}>Chargement...</div>
        ) : replays.length === 0 ? (
          <EmptyState icon={History} title="Aucun replay" hint="Publiez un programme déjà diffusé depuis la grille pour alimenter le catalogue." />
        ) : (
          <table className="table-shell w-full">
            <thead>
              <tr>
                <th>Titre</th>
                <th>Statut</th>
                <th>Fenêtre de droits</th>
                <th>Durée</th>
                <th>Vues</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {replays.map((r) => (
                <tr key={r.id}>
                  <td className="font-semibold" style={{ color: 'var(--color-ink)' }}>
                    <div className="flex items-center gap-2">
                      {r.vignetteUrl && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={r.vignetteUrl} alt="" className="w-10 h-6 rounded object-cover shrink-0" />
                      )}
                      <span>{r.titre}</span>
                      {r.matchId && <Badge tone="live"><Trophy className="w-3 h-3" /> Match</Badge>}
                    </div>
                  </td>
                  <td>
                    <div className="flex items-center gap-1.5">
                      <Badge tone={STATUT[r.statut].tone}>{STATUT[r.statut].label}</Badge>
                      {r.statut === 'PUBLIE' && fenetreExpiree(r) && <Badge tone="danger">Droits expirés</Badge>}
                    </div>
                  </td>
                  <td className="text-xs">{formatFenetre(r.disponibleDu, r.disponibleAu)}</td>
                  <td className="font-mono">{formatDuree(r.dureeSecondes)}</td>
                  <td className="font-mono">
                    <span className="inline-flex items-center gap-1"><Eye className="w-3.5 h-3.5" /> {r.nombreVues}</span>
                  </td>
                  <td>
                    <div className="flex justify-end gap-1.5">
                      {r.statut === 'PUBLIE' ? (
                        <button title="Retirer du catalogue" onClick={() => action(() => retirer(r.id))} className="p-2 rounded-lg" style={{ color: 'var(--color-warning)' }}>
                          <EyeOff className="w-4 h-4" />
                        </button>
                      ) : (
                        <button title="Publier au catalogue" onClick={() => action(() => publier(r.id))} className="p-2 rounded-lg" style={{ color: 'var(--color-success)' }}>
                          <Send className="w-4 h-4" />
                        </button>
                      )}
                      <button title="Vignette" onClick={() => declencherUpload(r.id)} className="p-2 rounded-lg" style={{ color: 'var(--color-ink-2)' }}>
                        <Upload className="w-4 h-4" />
                      </button>
                      <button title="Éditer" onClick={() => { setEditing(r); setModalOpen(true); }} className="p-2 rounded-lg" style={{ color: 'var(--color-ink-2)' }}>
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button title="Supprimer" onClick={() => handleDelete(r)} className="p-2 rounded-lg" style={{ color: 'var(--color-danger)' }}>
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <input ref={fileInput} type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={handleFichier} />

      <ReplayModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        replay={editing}
        onSubmit={async (data) => {
          if (editing) await updateReplay(editing.id, data);
          else await createReplay(data);
        }}
      />

      <DepuisCreneauModal
        open={depuisCreneauOpen}
        onClose={() => setDepuisCreneauOpen(false)}
        onSubmit={createDepuisCreneau}
      />
    </div>
  );
}
