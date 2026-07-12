'use client';
import { useEffect, useState } from 'react';
import { Building2, Plus } from 'lucide-react';
import { useEtablissementsStore } from '@/stores/etablissementsStore';
import EmptyState from '@/components/ui/EmptyState';
import Badge from '@/components/ui/Badge';
import EtablissementModal from '@/components/chambres/EtablissementModal';

export default function EtablissementsPage() {
  const { etablissements, isLoading, fetchAll, toggleActif } = useEtablissementsStore();
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-5">
      <div className="flex justify-end">
        <button onClick={() => setModalOpen(true)} className="btn btn-primary">
          <Plus className="w-4 h-4" />
          Établissement
        </button>
      </div>

      <div className="card overflow-x-auto">
        {isLoading ? (
          <div className="p-10 text-center text-sm" style={{ color: 'var(--color-ink-3)' }}>Chargement...</div>
        ) : etablissements.length === 0 ? (
          <EmptyState icon={Building2} title="Aucun établissement" />
        ) : (
          <table className="table-shell w-full">
            <thead><tr><th>Nom</th><th>Commune</th><th>Département</th><th>Devises</th><th>Statut</th><th></th></tr></thead>
            <tbody>
              {etablissements.map((e) => (
                <tr key={e.id}>
                  <td className="font-semibold" style={{ color: 'var(--color-ink)' }}>{e.nom}</td>
                  <td>{e.commune}</td>
                  <td>{e.departement}</td>
                  <td>{e.devisesAcceptees.join(', ')}</td>
                  <td><Badge tone={e.actif ? 'success' : 'neutral'}>{e.actif ? 'Actif' : 'Désactivé'}</Badge></td>
                  <td>
                    <button onClick={() => toggleActif(e.id, !e.actif)} className="text-xs font-semibold" style={{ color: e.actif ? 'var(--color-danger)' : 'var(--color-success)' }}>
                      {e.actif ? 'Désactiver' : 'Réactiver'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <EtablissementModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
}
