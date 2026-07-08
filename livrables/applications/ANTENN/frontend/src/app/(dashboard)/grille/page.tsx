'use client';
import { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, CheckCircle2, Copy, Pencil, Trash2, UploadCloud } from 'lucide-react';
import { useGrilleStore, Creneau } from '@/stores/grilleStore';
import Badge from '@/components/ui/Badge';
import PageToolbar from '@/components/ui/PageToolbar';
import EmptyState from '@/components/ui/EmptyState';
import Timeline from '@/components/grille/Timeline';
import CreneauModal from '@/components/grille/CreneauModal';
import DupliquerModal from '@/components/grille/DupliquerModal';

const TYPE_LABEL: Record<string, string> = {
  PROGRAMME: 'Programme',
  MATCH_DIRECT: 'Match direct',
  PUB: 'Pub',
};

function todayInputValue() {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function formatHeure(iso: string) {
  return new Date(iso).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
}

export default function GrillePage() {
  const { creneaux, brouillons, isLoading, fetchCreneaux, createCreneau, updateCreneau, deleteCreneau, dupliquerCreneau, synchroniserCreneau } = useGrilleStore();
  const [jourStr, setJourStr] = useState(todayInputValue());
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Creneau | null>(null);
  const [dupliquerCible, setDupliquerCible] = useState<Creneau | null>(null);
  const [erreur, setErreur] = useState('');

  const jour = useMemo(() => new Date(`${jourStr}T00:00:00`), [jourStr]);

  useEffect(() => {
    const from = new Date(jour);
    const to = new Date(jour);
    to.setHours(23, 59, 59, 999);
    fetchCreneaux(from.toISOString(), to.toISOString());
  }, [jour, fetchCreneaux]);

  const handleDelete = async (c: Creneau) => {
    if (!confirm('Supprimer ce créneau ?')) return;
    setErreur('');
    try {
      await deleteCreneau(c.id);
    } catch (err: any) {
      setErreur(err.response?.data?.message || 'Suppression impossible');
    }
  };

  const handleSynchroniser = async (c: Creneau) => {
    setErreur('');
    try {
      await synchroniserCreneau(c.id);
    } catch (err: any) {
      setErreur(err.response?.data?.message || 'Erreur');
    }
  };

  const estPasse = (c: Creneau) => new Date(c.dateHeureFin) < new Date();

  return (
    <div className="space-y-5">
      {/* Séparation brouillon / antenne — jamais confondre une modif en cours avec le réel */}
      <div
        className="flex items-center gap-3 p-4 rounded-xl"
        style={
          brouillons > 0
            ? { background: 'var(--color-warning-soft)', border: '1px solid rgba(245,158,11,0.3)' }
            : { background: 'var(--color-success-soft)', border: '1px solid rgba(34,197,94,0.3)' }
        }
      >
        {brouillons > 0 ? (
          <>
            <AlertTriangle className="w-5 h-5 shrink-0" style={{ color: 'var(--color-warning)' }} />
            <p className="text-sm font-semibold" style={{ color: 'var(--color-warning)' }}>
              {brouillons} créneau{brouillons > 1 ? 'x' : ''} en brouillon — non encore répercuté{brouillons > 1 ? 's' : ''} dans ErsatzTV.
            </p>
          </>
        ) : (
          <>
            <CheckCircle2 className="w-5 h-5 shrink-0" style={{ color: 'var(--color-success)' }} />
            <p className="text-sm font-semibold" style={{ color: 'var(--color-success)' }}>Grille entièrement synchronisée.</p>
          </>
        )}
      </div>

      <PageToolbar actionLabel="Nouveau créneau" onAction={() => { setEditing(null); setModalOpen(true); }} />

      <div className="flex items-center gap-3">
        <label className="text-xs font-bold tracking-widest" style={{ color: 'var(--color-ink-3)' }}>JOUR</label>
        <input type="date" className="input w-auto" value={jourStr} onChange={(e) => setJourStr(e.target.value)} />
      </div>

      {erreur && (
        <div className="p-3 rounded-xl text-sm" style={{ background: 'var(--color-danger-soft)', color: 'var(--color-danger)' }}>{erreur}</div>
      )}

      <Timeline creneaux={creneaux} jour={jour} onSelect={(c) => { setEditing(c); setModalOpen(true); }} />

      <div className="card overflow-x-auto">
        {isLoading ? (
          <div className="py-14 text-center text-sm" style={{ color: 'var(--color-ink-3)' }}>Chargement...</div>
        ) : creneaux.length === 0 ? (
          <EmptyState title="Aucun créneau ce jour-là" hint="Créez un créneau pour commencer à remplir la grille." />
        ) : (
          <table className="table-shell w-full">
            <thead>
              <tr>
                <th>Horaire</th>
                <th>Type</th>
                <th>Contenu / Match</th>
                <th>Statut</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {creneaux.map((c) => {
                const passe = estPasse(c);
                return (
                  <tr key={c.id}>
                    <td className="font-mono">{formatHeure(c.dateHeureDebut)} – {formatHeure(c.dateHeureFin)}</td>
                    <td>
                      <Badge tone={c.typeCreneau === 'MATCH_DIRECT' ? 'live' : c.typeCreneau === 'PUB' ? 'gold' : 'brand'} pulse={c.typeCreneau === 'MATCH_DIRECT'}>
                        {TYPE_LABEL[c.typeCreneau]}
                      </Badge>
                    </td>
                    <td>{c.contenu?.titre || c.match?.nomEvenement || '—'}</td>
                    <td>
                      <Badge tone={c.syncStatus === 'SYNCHRONISE' ? 'success' : 'warning'}>
                        {c.syncStatus === 'SYNCHRONISE' ? 'Synchronisé' : 'Brouillon'}
                      </Badge>
                    </td>
                    <td>
                      <div className="flex justify-end gap-1.5">
                        {c.syncStatus === 'BROUILLON' && (
                          <button title="Marquer synchronisé" onClick={() => handleSynchroniser(c)} className="p-2 rounded-lg transition-colors" style={{ color: 'var(--color-success)' }}>
                            <UploadCloud className="w-4 h-4" />
                          </button>
                        )}
                        <button title="Dupliquer" onClick={() => setDupliquerCible(c)} className="p-2 rounded-lg transition-colors" style={{ color: 'var(--color-ink-2)' }}>
                          <Copy className="w-4 h-4" />
                        </button>
                        <button
                          title={passe ? 'Créneau déjà diffusé — historique figé' : 'Éditer'}
                          disabled={passe}
                          onClick={() => { setEditing(c); setModalOpen(true); }}
                          className="p-2 rounded-lg transition-colors disabled:opacity-30"
                          style={{ color: 'var(--color-ink-2)' }}
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          title={passe ? 'Créneau déjà diffusé — historique figé' : 'Supprimer'}
                          disabled={passe}
                          onClick={() => handleDelete(c)}
                          className="p-2 rounded-lg transition-colors disabled:opacity-30"
                          style={{ color: 'var(--color-danger)' }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      <CreneauModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        creneau={editing}
        onSubmit={async (data) => {
          if (editing) await updateCreneau(editing.id, data);
          else await createCreneau(data);
        }}
      />

      <DupliquerModal
        open={!!dupliquerCible}
        onClose={() => setDupliquerCible(null)}
        creneau={dupliquerCible}
        onSubmit={async (dateHeureDebut) => {
          if (dupliquerCible) await dupliquerCreneau(dupliquerCible.id, dateHeureDebut);
        }}
      />
    </div>
  );
}
