'use client';
import { useEffect, useState } from 'react';
import { Film, Pencil, Trash2 } from 'lucide-react';
import { useContenuStore, Contenu } from '@/stores/contenuStore';
import Badge from '@/components/ui/Badge';
import PageToolbar from '@/components/ui/PageToolbar';
import EmptyState from '@/components/ui/EmptyState';
import ContenuModal from '@/components/contenus/ContenuModal';

const TYPE_LABEL: Record<string, string> = {
  VIDEO_BOUCLE: 'Vidéo boucle',
  SPOT_PUBLICITAIRE: 'Spot publicitaire',
  HABILLAGE_LOGO: 'Habillage logo',
};

function formatDuree(s: number) {
  if (s === 0) return '—';
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return m > 0 ? `${m}min ${sec}s` : `${sec}s`;
}

export default function ContenusPage() {
  const { contenus, isLoading, fetchContenus, createContenu, updateContenu, deleteContenu } = useContenuStore();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Contenu | null>(null);
  const [erreur, setErreur] = useState('');

  useEffect(() => {
    fetchContenus();
  }, [fetchContenus]);

  const handleDelete = async (c: Contenu) => {
    if (!confirm(`Supprimer le contenu "${c.titre}" ?`)) return;
    setErreur('');
    try {
      await deleteContenu(c.id);
    } catch (err: any) {
      setErreur(err.response?.data?.message || 'Suppression impossible');
    }
  };

  return (
    <div className="space-y-5">
      <PageToolbar actionLabel="Nouveau contenu" onAction={() => { setEditing(null); setModalOpen(true); }} />

      {erreur && <div className="p-3 rounded-xl text-sm" style={{ background: 'var(--color-danger-soft)', color: 'var(--color-danger)' }}>{erreur}</div>}

      <div className="card overflow-x-auto">
        {isLoading ? (
          <div className="py-14 text-center text-sm" style={{ color: 'var(--color-ink-3)' }}>Chargement...</div>
        ) : contenus.length === 0 ? (
          <EmptyState icon={Film} title="Aucun contenu" hint="Ajoutez une vidéo, un spot ou un habillage pour alimenter la grille." />
        ) : (
          <table className="table-shell w-full">
            <thead>
              <tr>
                <th>Titre</th>
                <th>Type</th>
                <th>Sponsor</th>
                <th>Durée</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {contenus.map((c) => (
                <tr key={c.id}>
                  <td className="font-semibold" style={{ color: 'var(--color-ink)' }}>{c.titre}</td>
                  <td><Badge tone={c.typeContenu === 'SPOT_PUBLICITAIRE' ? 'gold' : c.typeContenu === 'HABILLAGE_LOGO' ? 'violet' : 'brand'}>{TYPE_LABEL[c.typeContenu]}</Badge></td>
                  <td>{c.sponsor?.nomSponsor || '—'}</td>
                  <td className="font-mono">{formatDuree(c.dureeSecondes)}</td>
                  <td>
                    <div className="flex justify-end gap-1.5">
                      <button title="Éditer" onClick={() => { setEditing(c); setModalOpen(true); }} className="p-2 rounded-lg" style={{ color: 'var(--color-ink-2)' }}>
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button title="Supprimer" onClick={() => handleDelete(c)} className="p-2 rounded-lg" style={{ color: 'var(--color-danger)' }}>
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

      <ContenuModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        contenu={editing}
        onSubmit={async (data) => {
          if (editing) await updateContenu(editing.id, data);
          else await createContenu(data);
        }}
      />
    </div>
  );
}
