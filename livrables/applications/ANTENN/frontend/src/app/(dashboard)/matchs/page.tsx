'use client';
import { useEffect, useState } from 'react';
import { Play, Square, Pencil, Radio } from 'lucide-react';
import { useMatchStore, Match } from '@/stores/matchStore';
import Badge from '@/components/ui/Badge';
import PageToolbar from '@/components/ui/PageToolbar';
import EmptyState from '@/components/ui/EmptyState';
import MatchModal from '@/components/grille/MatchModal';

const STATUT_LABEL: Record<string, string> = {
  PLANIFIE: 'Planifié',
  EN_COURS: 'En direct',
  TERMINE: 'Terminé',
};

export default function MatchsPage() {
  const { matchs, isLoading, fetchMatchs, createMatch, updateMatch, demarrerDirect, terminerDirect } = useMatchStore();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Match | null>(null);
  const [erreur, setErreur] = useState('');

  useEffect(() => {
    fetchMatchs();
  }, [fetchMatchs]);

  const handleDemarrer = async (m: Match) => {
    setErreur('');
    if (!m.ingestUrlRtmp) {
      if (!confirm('Aucune URL d\'ingest RTMP n\'est renseignée pour ce match. Démarrer quand même ?')) return;
    }
    try {
      await demarrerDirect(m.id);
    } catch (err: any) {
      setErreur(err.response?.data?.message || 'Erreur');
    }
  };

  const handleTerminer = async (m: Match) => {
    setErreur('');
    try {
      await terminerDirect(m.id);
    } catch (err: any) {
      setErreur(err.response?.data?.message || 'Erreur');
    }
  };

  return (
    <div className="space-y-5">
      <PageToolbar actionLabel="Nouveau match" onAction={() => { setEditing(null); setModalOpen(true); }} />

      {erreur && <div className="p-3 rounded-xl text-sm" style={{ background: 'var(--color-danger-soft)', color: 'var(--color-danger)' }}>{erreur}</div>}

      <div className="card overflow-x-auto">
        {isLoading ? (
          <div className="py-14 text-center text-sm" style={{ color: 'var(--color-ink-3)' }}>Chargement...</div>
        ) : matchs.length === 0 ? (
          <EmptyState icon={Radio} title="Aucun match programmé" hint="Créez un match pour préparer un direct sportif." />
        ) : (
          <table className="table-shell w-full">
            <thead>
              <tr>
                <th>Événement</th>
                <th>Équipes</th>
                <th>Date prévue</th>
                <th>Sponsor titre</th>
                <th>Statut</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {matchs.map((m) => (
                <tr key={m.id}>
                  <td className="font-semibold" style={{ color: 'var(--color-ink)' }}>{m.nomEvenement}</td>
                  <td>{m.equipes}</td>
                  <td className="font-mono">{new Date(m.dateHeurePrevue).toLocaleString('fr-FR')}</td>
                  <td>{m.sponsorPrincipal?.nomSponsor || '—'}</td>
                  <td>
                    <Badge tone={m.statutDiffusion === 'EN_COURS' ? 'live' : m.statutDiffusion === 'TERMINE' ? 'neutral' : 'brand'} pulse={m.statutDiffusion === 'EN_COURS'}>
                      {STATUT_LABEL[m.statutDiffusion]}
                    </Badge>
                  </td>
                  <td>
                    <div className="flex justify-end gap-1.5">
                      {m.statutDiffusion === 'PLANIFIE' && (
                        <button title="Démarrer le direct" onClick={() => handleDemarrer(m)} className="p-2 rounded-lg" style={{ color: 'var(--color-success)' }}>
                          <Play className="w-4 h-4" />
                        </button>
                      )}
                      {m.statutDiffusion === 'EN_COURS' && (
                        <button title="Terminer le direct" onClick={() => handleTerminer(m)} className="p-2 rounded-lg" style={{ color: 'var(--color-danger)' }}>
                          <Square className="w-4 h-4" />
                        </button>
                      )}
                      {m.statutDiffusion !== 'TERMINE' && (
                        <button title="Éditer" onClick={() => { setEditing(m); setModalOpen(true); }} className="p-2 rounded-lg" style={{ color: 'var(--color-ink-2)' }}>
                          <Pencil className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <MatchModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        match={editing}
        onSubmit={async (data) => {
          if (editing) await updateMatch(editing.id, data);
          else await createMatch(data);
        }}
      />
    </div>
  );
}
