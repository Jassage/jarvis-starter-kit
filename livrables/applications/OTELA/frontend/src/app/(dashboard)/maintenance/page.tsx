'use client';
import { useEffect, useState } from 'react';
import { Wrench, ArrowRight } from 'lucide-react';
import { useMaintenanceStore, StatutTicket, PrioriteTicket } from '@/stores/maintenanceStore';
import { useChambresStore } from '@/stores/chambresStore';
import { useAuthStore } from '@/stores/authStore';
import EmptyState from '@/components/ui/EmptyState';
import Badge from '@/components/ui/Badge';
import PageToolbar from '@/components/ui/PageToolbar';
import TicketModal from '@/components/maintenance/TicketModal';

const STATUT_TONE: Record<StatutTicket, 'warning' | 'info' | 'success'> = {
  A_FAIRE: 'warning',
  EN_COURS: 'info',
  RESOLU: 'success',
};
const STATUT_LABEL: Record<StatutTicket, string> = { A_FAIRE: 'À faire', EN_COURS: 'En cours', RESOLU: 'Résolu' };
const PROCHAIN_STATUT: Record<StatutTicket, StatutTicket | null> = { A_FAIRE: 'EN_COURS', EN_COURS: 'RESOLU', RESOLU: null };

const PRIORITE_TONE: Record<PrioriteTicket, 'neutral' | 'info' | 'warning' | 'danger'> = {
  BASSE: 'neutral',
  NORMALE: 'info',
  HAUTE: 'warning',
  URGENTE: 'danger',
};
const PRIORITE_LABEL: Record<PrioriteTicket, string> = { BASSE: 'Basse', NORMALE: 'Normale', HAUTE: 'Haute', URGENTE: 'Urgente' };

// MENAGE/RECEPTION peuvent signaler mais pas piloter la résolution — seul le rôle
// Maintenance et la direction avancent le statut ou assignent (RBAC déjà appliqué côté
// serveur, ceci n'est qu'un confort d'affichage).
const ROLES_GESTION = ['MAINTENANCE', 'ADMINISTRATEUR_ETABLISSEMENT', 'ADMINISTRATEUR_CHAINE'];

export default function MaintenancePage() {
  const { tickets, employes, isLoading, fetchTickets, fetchEmployes, updateTicket } = useMaintenanceStore();
  const { chambres, fetchAll } = useChambresStore();
  const { employe } = useAuthStore();
  const [filtre, setFiltre] = useState('');
  const [modalOpen, setModalOpen] = useState(false);

  const peutGerer = employe ? ROLES_GESTION.includes(employe.role) : false;

  useEffect(() => {
    fetchEmployes();
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetchTickets(filtre || undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtre]);

  const avancer = async (id: string, statutActuel: StatutTicket) => {
    const suivant = PROCHAIN_STATUT[statutActuel];
    if (!suivant) return;
    try {
      await updateTicket(id, { statut: suivant });
    } catch (err: any) {
      alert(err.response?.data?.message || 'Impossible de mettre à jour le ticket');
    }
  };

  const assigner = async (id: string, employeAssigneId: string) => {
    try {
      await updateTicket(id, { employeAssigneId: employeAssigneId || null });
    } catch (err: any) {
      alert(err.response?.data?.message || 'Impossible d\'assigner le ticket');
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
        <select className="input sm:max-w-[200px]" value={filtre} onChange={(e) => setFiltre(e.target.value)}>
          <option value="">Tous les tickets</option>
          <option value="A_FAIRE">À faire</option>
          <option value="EN_COURS">En cours</option>
          <option value="RESOLU">Résolus</option>
        </select>
        <PageToolbar actionLabel="Signaler un problème" onAction={() => setModalOpen(true)} />
      </div>

      <div className="card overflow-x-auto">
        {isLoading ? (
          <div className="p-10 text-center text-sm" style={{ color: 'var(--color-ink-3)' }}>Chargement...</div>
        ) : tickets.length === 0 ? (
          <EmptyState icon={Wrench} title="Aucun ticket de maintenance" hint="Signalez un problème sur une chambre ou une zone commune." />
        ) : (
          <table className="table-shell w-full">
            <thead><tr><th>Problème</th><th>Localisation</th><th>Priorité</th><th>Statut</th><th>Assigné</th><th></th></tr></thead>
            <tbody>
              {tickets.map((t) => (
                <tr key={t.id}>
                  <td className="font-semibold" style={{ color: 'var(--color-ink)' }}>{t.titre}</td>
                  <td>{t.chambre ? `${t.chambre.typeChambre.nom} — ${t.chambre.numero}` : t.zone}</td>
                  <td><Badge tone={PRIORITE_TONE[t.priorite]}>{PRIORITE_LABEL[t.priorite]}</Badge></td>
                  <td><Badge tone={STATUT_TONE[t.statut]}>{STATUT_LABEL[t.statut]}</Badge></td>
                  <td>
                    {peutGerer ? (
                      <select
                        className="input"
                        style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem' }}
                        value={t.employeAssigne?.id || ''}
                        onChange={(e) => assigner(t.id, e.target.value)}
                        disabled={t.statut === 'RESOLU'}
                      >
                        <option value="">Non assigné</option>
                        {employes.map((e) => <option key={e.id} value={e.id}>{e.nom}</option>)}
                      </select>
                    ) : (t.employeAssigne?.nom || '—')}
                  </td>
                  <td>
                    {peutGerer && PROCHAIN_STATUT[t.statut] && (
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

      <TicketModal open={modalOpen} onClose={() => setModalOpen(false)} chambres={chambres} />
    </div>
  );
}
