'use client';
import { useEffect, useState } from 'react';
import { Sparkles, Trash2, Image as ImageIcon, Rows3 } from 'lucide-react';
import { useHabillageStore } from '@/stores/habillageStore';
import Badge from '@/components/ui/Badge';
import EmptyState from '@/components/ui/EmptyState';
import IncrustationModal from '@/components/habillage/IncrustationModal';
import BandeauModal from '@/components/habillage/BandeauModal';

const POSITION_LABEL: Record<string, string> = {
  HAUT_GAUCHE: 'Haut gauche',
  HAUT_DROITE: 'Haut droite',
  BAS_GAUCHE: 'Bas gauche',
  BAS_DROITE: 'Bas droite',
};

export default function HabillagePage() {
  const { incrustations, bandeaux, isLoading, fetchAll, createIncrustation, deleteIncrustation, createBandeau, deleteBandeau } = useHabillageStore();
  const [incModalOpen, setIncModalOpen] = useState(false);
  const [bandModalOpen, setBandModalOpen] = useState(false);
  const [erreur, setErreur] = useState('');

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const handleDeleteIncrustation = async (id: string) => {
    if (!confirm('Supprimer cette incrustation ?')) return;
    setErreur('');
    try { await deleteIncrustation(id); } catch (err: any) { setErreur(err.response?.data?.message || 'Erreur'); }
  };

  const handleDeleteBandeau = async (id: string) => {
    if (!confirm('Supprimer ce bandeau ?')) return;
    setErreur('');
    try { await deleteBandeau(id); } catch (err: any) { setErreur(err.response?.data?.message || 'Erreur'); }
  };

  return (
    <div className="space-y-8">
      {erreur && <div className="p-3 rounded-xl text-sm" style={{ background: 'var(--color-danger-soft)', color: 'var(--color-danger)' }}>{erreur}</div>}

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold tracking-widest flex items-center gap-2" style={{ color: 'var(--color-ink-3)' }}>
            <ImageIcon className="w-4 h-4" /> INCRUSTATIONS LOGO
          </h2>
          <button onClick={() => setIncModalOpen(true)} className="btn btn-primary">Nouvelle incrustation</button>
        </div>
        <div className="card overflow-x-auto">
          {isLoading ? (
            <div className="py-10 text-center text-sm" style={{ color: 'var(--color-ink-3)' }}>Chargement...</div>
          ) : incrustations.length === 0 ? (
            <EmptyState icon={ImageIcon} title="Aucune incrustation configurée" />
          ) : (
            <table className="table-shell w-full">
              <thead>
                <tr><th>Sponsor</th><th>Rattachée à</th><th>Position</th><th>Opacité</th><th className="text-right">Actions</th></tr>
              </thead>
              <tbody>
                {incrustations.map((i) => (
                  <tr key={i.id}>
                    <td className="font-semibold" style={{ color: 'var(--color-ink)' }}>{i.sponsor?.nomSponsor || '—'}</td>
                    <td>{i.matchId ? <Badge tone="live">Match</Badge> : <Badge tone="brand">Créneau</Badge>}</td>
                    <td>{POSITION_LABEL[i.position]}</td>
                    <td className="font-mono">{Math.round(i.opacite * 100)}%</td>
                    <td>
                      <div className="flex justify-end">
                        <button title="Supprimer" onClick={() => handleDeleteIncrustation(i.id)} className="p-2 rounded-lg" style={{ color: 'var(--color-danger)' }}>
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
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold tracking-widest flex items-center gap-2" style={{ color: 'var(--color-ink-3)' }}>
            <Rows3 className="w-4 h-4" /> BANDEAUX DÉROULANTS
          </h2>
          <button onClick={() => setBandModalOpen(true)} className="btn btn-primary">Nouveau bandeau</button>
        </div>
        <div className="card overflow-x-auto">
          {isLoading ? (
            <div className="py-10 text-center text-sm" style={{ color: 'var(--color-ink-3)' }}>Chargement...</div>
          ) : bandeaux.length === 0 ? (
            <EmptyState icon={Sparkles} title="Aucun bandeau configuré" />
          ) : (
            <table className="table-shell w-full">
              <thead>
                <tr><th>Éléments</th><th>Rattaché à</th><th>Vitesse</th><th className="text-right">Actions</th></tr>
              </thead>
              <tbody>
                {bandeaux.map((b) => (
                  <tr key={b.id}>
                    <td>{b.items.map((it) => it.texte).join(' • ')}</td>
                    <td>{b.matchId ? <Badge tone="live">Match</Badge> : <Badge tone="brand">Créneau</Badge>}</td>
                    <td className="font-mono">{b.vitesseDefilement}</td>
                    <td>
                      <div className="flex justify-end">
                        <button title="Supprimer" onClick={() => handleDeleteBandeau(b.id)} className="p-2 rounded-lg" style={{ color: 'var(--color-danger)' }}>
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
      </section>

      <IncrustationModal open={incModalOpen} onClose={() => setIncModalOpen(false)} onSubmit={createIncrustation} />
      <BandeauModal open={bandModalOpen} onClose={() => setBandModalOpen(false)} onSubmit={createBandeau} />
    </div>
  );
}
