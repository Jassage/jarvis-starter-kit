'use client';
import { useEffect, useState } from 'react';
import { CalendarClock, X, Receipt } from 'lucide-react';
import { useReservationsStore } from '@/stores/reservationsStore';
import { useChambresStore } from '@/stores/chambresStore';
import PageToolbar from '@/components/ui/PageToolbar';
import EmptyState from '@/components/ui/EmptyState';
import Badge from '@/components/ui/Badge';
import ReservationModal from '@/components/reservations/ReservationModal';
import FactureModal from '@/components/reservations/FactureModal';

const STATUT_TONE: Record<string, 'success' | 'warning' | 'danger' | 'neutral' | 'brand'> = {
  CONFIRMEE: 'success',
  EN_ATTENTE: 'warning',
  ANNULEE: 'danger',
  TERMINEE: 'neutral',
  NO_SHOW: 'danger',
};

const STATUT_LABEL: Record<string, string> = {
  CONFIRMEE: 'Confirmée',
  EN_ATTENTE: 'En attente',
  ANNULEE: 'Annulée',
  TERMINEE: 'Terminée',
  NO_SHOW: 'No-show',
};

export default function ReservationsPage() {
  const { reservations, isLoading, fetchReservations, annuler } = useReservationsStore();
  const { fetchAll } = useChambresStore();
  const [search, setSearch] = useState('');
  const [statut, setStatut] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [factureReservationId, setFactureReservationId] = useState<string | null>(null);

  useEffect(() => {
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetchReservations({ statut: statut || undefined, search: search || undefined });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statut, search]);

  const handleAnnuler = async (id: string) => {
    if (!confirm('Annuler cette réservation ?')) return;
    try {
      await annuler(id);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Impossible d\'annuler');
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex-1">
          <PageToolbar search={search} onSearch={setSearch} searchPlaceholder="Client, email, chambre..." actionLabel="Nouvelle réservation" onAction={() => setModalOpen(true)} />
        </div>
        <select className="input sm:max-w-[180px]" value={statut} onChange={(e) => setStatut(e.target.value)}>
          <option value="">Tous les statuts</option>
          {Object.entries(STATUT_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
      </div>

      <div className="card overflow-x-auto">
        {isLoading ? (
          <div className="p-10 text-center text-sm" style={{ color: 'var(--color-ink-3)' }}>Chargement...</div>
        ) : reservations.length === 0 ? (
          <EmptyState icon={CalendarClock} title="Aucune réservation" hint="Les réservations du site public et créées manuellement apparaîtront ici." />
        ) : (
          <table className="table-shell w-full">
            <thead>
              <tr>
                <th>Client</th>
                <th>Chambre</th>
                <th>Séjour</th>
                <th>Arrivée</th>
                <th>Départ</th>
                <th>Montant</th>
                <th>Statut</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {reservations.map((r) => (
                <tr key={r.id}>
                  <td>
                    <p className="font-semibold" style={{ color: 'var(--color-ink)' }}>{r.client.nom}</p>
                    <p className="text-xs" style={{ color: 'var(--color-ink-3)' }}>{r.client.email}</p>
                  </td>
                  <td>{r.chambre.typeChambre.nom} — {r.chambre.numero}</td>
                  <td><Badge tone={r.typeSejour === 'JOUR' ? 'gold' : 'neutral'}>{r.typeSejour === 'JOUR' ? 'Day-use' : 'Nuitée'}</Badge></td>
                  {r.typeSejour === 'JOUR' ? (
                    <>
                      <td>{new Date(r.dateArrivee).toLocaleDateString('fr-FR')} {new Date(r.dateArrivee).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</td>
                      <td>{new Date(r.dateDepart).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</td>
                    </>
                  ) : (
                    <>
                      <td>{new Date(r.dateArrivee).toLocaleDateString('fr-FR')}</td>
                      <td>{new Date(r.dateDepart).toLocaleDateString('fr-FR')}</td>
                    </>
                  )}
                  <td>{Number(r.montantTotal).toLocaleString('fr-FR')} {r.devise}</td>
                  <td><Badge tone={STATUT_TONE[r.statut]}>{STATUT_LABEL[r.statut]}</Badge></td>
                  <td>
                    <div className="flex items-center gap-3">
                      <button onClick={() => setFactureReservationId(r.id)} className="text-xs font-semibold flex items-center gap-1" style={{ color: 'var(--color-primary-2)' }}>
                        <Receipt className="w-3.5 h-3.5" />
                        Facture
                      </button>
                      {(r.statut === 'CONFIRMEE' || r.statut === 'EN_ATTENTE') && (
                        <button onClick={() => handleAnnuler(r.id)} className="text-xs font-semibold flex items-center gap-1" style={{ color: 'var(--color-danger)' }}>
                          <X className="w-3.5 h-3.5" />
                          Annuler
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

      <ReservationModal open={modalOpen} onClose={() => setModalOpen(false)} />
      <FactureModal open={factureReservationId !== null} onClose={() => setFactureReservationId(null)} reservationId={factureReservationId} />
    </div>
  );
}
