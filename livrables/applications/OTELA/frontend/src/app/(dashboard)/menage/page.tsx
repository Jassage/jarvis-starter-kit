'use client';
import { useEffect, useState } from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';
import { useMenageStore, StatutTache } from '@/stores/menageStore';
import EmptyState from '@/components/ui/EmptyState';
import Badge from '@/components/ui/Badge';

const STATUT_TONE: Record<StatutTache, 'warning' | 'info' | 'success'> = {
  A_FAIRE: 'warning',
  EN_COURS: 'info',
  TERMINE: 'success',
};

const STATUT_LABEL: Record<StatutTache, string> = {
  A_FAIRE: 'À faire',
  EN_COURS: 'En cours',
  TERMINE: 'Terminée',
};

const PROCHAIN_STATUT: Record<StatutTache, StatutTache | null> = {
  A_FAIRE: 'EN_COURS',
  EN_COURS: 'TERMINE',
  TERMINE: null,
};

export default function MenagePage() {
  const { taches, employes, isLoading, fetchTaches, fetchEmployes, updateTache } = useMenageStore();
  const [filtre, setFiltre] = useState('');

  useEffect(() => {
    fetchEmployes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetchTaches(filtre || undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtre]);

  const avancer = async (id: string, statutActuel: StatutTache) => {
    const suivant = PROCHAIN_STATUT[statutActuel];
    if (!suivant) return;
    try {
      await updateTache(id, { statut: suivant });
    } catch (err: any) {
      alert(err.response?.data?.message || 'Impossible de mettre à jour la tâche');
    }
  };

  const assigner = async (id: string, employeAssigneId: string) => {
    try {
      await updateTache(id, { employeAssigneId: employeAssigneId || null });
    } catch (err: any) {
      alert(err.response?.data?.message || 'Impossible d\'assigner la tâche');
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex justify-end">
        <select className="input sm:max-w-[200px]" value={filtre} onChange={(e) => setFiltre(e.target.value)}>
          <option value="">Toutes les tâches</option>
          <option value="A_FAIRE">À faire</option>
          <option value="EN_COURS">En cours</option>
          <option value="TERMINE">Terminées</option>
        </select>
      </div>

      <div className="card overflow-x-auto">
        {isLoading ? (
          <div className="p-10 text-center text-sm" style={{ color: 'var(--color-ink-3)' }}>Chargement...</div>
        ) : taches.length === 0 ? (
          <EmptyState icon={Sparkles} title="Aucune tâche de ménage" hint="Les tâches sont créées automatiquement à chaque check-out." />
        ) : (
          <table className="table-shell w-full">
            <thead><tr><th>Chambre</th><th>Assignée le</th><th>Statut</th><th>Employé</th><th></th></tr></thead>
            <tbody>
              {taches.map((t) => (
                <tr key={t.id}>
                  <td className="font-semibold" style={{ color: 'var(--color-ink)' }}>{t.chambre.typeChambre.nom} — {t.chambre.numero}</td>
                  <td>{new Date(t.dateAssignation).toLocaleString('fr-FR')}</td>
                  <td><Badge tone={STATUT_TONE[t.statut]}>{STATUT_LABEL[t.statut]}</Badge></td>
                  <td>
                    <select
                      className="input"
                      style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem' }}
                      value={t.employeAssigne?.id || ''}
                      onChange={(e) => assigner(t.id, e.target.value)}
                      disabled={t.statut === 'TERMINE'}
                    >
                      <option value="">Non assignée</option>
                      {employes.map((e) => <option key={e.id} value={e.id}>{e.nom}</option>)}
                    </select>
                  </td>
                  <td>
                    {PROCHAIN_STATUT[t.statut] && (
                      <button onClick={() => avancer(t.id, t.statut)} className="text-xs font-semibold flex items-center gap-1" style={{ color: 'var(--color-primary-2)' }}>
                        <ArrowRight className="w-3.5 h-3.5" />
                        Marquer {STATUT_LABEL[PROCHAIN_STATUT[t.statut]!].toLowerCase()}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
