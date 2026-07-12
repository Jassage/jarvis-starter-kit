'use client';
import { Fragment, useEffect, useState } from 'react';
import { Users, Plus, KeyRound } from 'lucide-react';
import { useEmployesStore } from '@/stores/employesStore';
import { useEtablissementsStore } from '@/stores/etablissementsStore';
import { useAuthStore } from '@/stores/authStore';
import EmptyState from '@/components/ui/EmptyState';
import Badge from '@/components/ui/Badge';
import EmployeModal from '@/components/employes/EmployeModal';
import type { RoleEmploye } from '@/lib/api';

const ROLE_LABEL: Record<RoleEmploye, string> = {
  RECEPTION: 'Réception',
  MENAGE: 'Ménage',
  SERVEUR: 'Serveur',
  ADMINISTRATEUR_ETABLISSEMENT: 'Admin établissement',
  ADMINISTRATEUR_CHAINE: 'Admin chaîne',
};

export default function EmployesPage() {
  const { employe: moi } = useAuthStore();
  const { employes, isLoading, fetchAll, update, reinitialiserMotDePasse } = useEmployesStore();
  const { etablissements, fetchAll: fetchEtablissements } = useEtablissementsStore();
  const estChaine = moi?.role === 'ADMINISTRATEUR_CHAINE';

  const [modalOpen, setModalOpen] = useState(false);
  const [filtreEtablissement, setFiltreEtablissement] = useState('');
  const [resetId, setResetId] = useState<string | null>(null);
  const [nouveauMdp, setNouveauMdp] = useState('');
  const [resetError, setResetError] = useState('');
  const [resetOk, setResetOk] = useState<string | null>(null);

  useEffect(() => {
    fetchAll(filtreEtablissement || undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtreEtablissement]);

  useEffect(() => {
    if (estChaine) fetchEtablissements();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [estChaine]);

  const nomEtablissement = (id: string | null) => etablissements.find((e) => e.id === id)?.nom ?? '—';

  const handleReset = async (id: string) => {
    setResetError('');
    if (nouveauMdp.length < 8) {
      setResetError('8 caractères minimum');
      return;
    }
    try {
      await reinitialiserMotDePasse(id, nouveauMdp);
      setResetId(null);
      setNouveauMdp('');
      setResetOk(id);
      setTimeout(() => setResetOk(null), 3000);
    } catch (err: any) {
      setResetError(err.response?.data?.message || 'Échec de la réinitialisation');
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {estChaine ? (
          <select className="input max-w-xs" value={filtreEtablissement} onChange={(e) => setFiltreEtablissement(e.target.value)}>
            <option value="">Tous les établissements</option>
            {etablissements.map((e) => <option key={e.id} value={e.id}>{e.nom}</option>)}
          </select>
        ) : <div />}
        <button onClick={() => setModalOpen(true)} className="btn btn-primary">
          <Plus className="w-4 h-4" />
          Employé
        </button>
      </div>

      <div className="card overflow-x-auto">
        {isLoading ? (
          <div className="p-10 text-center text-sm" style={{ color: 'var(--color-ink-3)' }}>Chargement...</div>
        ) : employes.length === 0 ? (
          <EmptyState icon={Users} title="Aucun employé" />
        ) : (
          <table className="table-shell w-full">
            <thead>
              <tr>
                <th>Nom</th>
                <th>Email</th>
                <th>Rôle</th>
                {estChaine && <th>Établissement</th>}
                <th>Statut</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {employes.map((e) => (
                <Fragment key={e.id}>
                  <tr>
                    <td className="font-semibold" style={{ color: 'var(--color-ink)' }}>{e.nom}</td>
                    <td>{e.email}</td>
                    <td>{ROLE_LABEL[e.role]}</td>
                    {estChaine && <td>{e.role === 'ADMINISTRATEUR_CHAINE' ? '—' : nomEtablissement(e.etablissementId)}</td>}
                    <td><Badge tone={e.isActive ? 'success' : 'neutral'}>{e.isActive ? 'Actif' : 'Désactivé'}</Badge></td>
                    <td>
                      <div className="flex items-center gap-3 justify-end">
                        {resetOk === e.id && <span className="text-xs font-semibold" style={{ color: 'var(--color-success)' }}>Mot de passe changé</span>}
                        <button onClick={() => { setResetId(resetId === e.id ? null : e.id); setResetError(''); setNouveauMdp(''); }} className="text-xs font-semibold inline-flex items-center gap-1" style={{ color: 'var(--color-ink-2)' }}>
                          <KeyRound className="w-3.5 h-3.5" />
                          Réinitialiser mdp
                        </button>
                        <button
                          onClick={() => update(e.id, { isActive: !e.isActive })}
                          disabled={e.id === moi?.id && e.isActive}
                          className="text-xs font-semibold disabled:opacity-40"
                          style={{ color: e.isActive ? 'var(--color-danger)' : 'var(--color-success)' }}
                        >
                          {e.isActive ? 'Désactiver' : 'Réactiver'}
                        </button>
                      </div>
                    </td>
                  </tr>
                  {resetId === e.id && (
                    <tr>
                      <td colSpan={estChaine ? 6 : 5}>
                        <div className="flex flex-wrap items-center gap-2 py-2">
                          <input
                            type="text"
                            placeholder="Nouveau mot de passe (8 caractères min.)"
                            className="input max-w-xs"
                            value={nouveauMdp}
                            onChange={(ev) => setNouveauMdp(ev.target.value)}
                          />
                          <button onClick={() => handleReset(e.id)} className="btn btn-primary" style={{ padding: '6px 14px', fontSize: '0.75rem' }}>Confirmer</button>
                          <button onClick={() => setResetId(null)} className="text-xs font-semibold" style={{ color: 'var(--color-ink-3)' }}>Annuler</button>
                          {resetError && <span className="text-xs font-semibold" style={{ color: 'var(--color-danger)' }}>{resetError}</span>}
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <EmployeModal open={modalOpen} onClose={() => setModalOpen(false)} estChaine={!!estChaine} />
    </div>
  );
}
