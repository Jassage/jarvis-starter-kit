'use client';
import { useEffect } from 'react';
import { LogIn, LogOut, DoorOpen } from 'lucide-react';
import { useReceptionStore } from '@/stores/receptionStore';
import EmptyState from '@/components/ui/EmptyState';
import StatCard from '@/components/ui/StatCard';

const STATUT_LABEL: Record<string, string> = {
  DISPONIBLE: 'Disponibles',
  OCCUPEE: 'Occupées',
  MAINTENANCE: 'Maintenance',
  NETTOYAGE_EN_COURS: 'En nettoyage',
};

export default function ReceptionPage() {
  const { arrivees, departs, chambresParStatut, isLoading, fetchVueDuJour, checkin, checkout } = useReceptionStore();

  useEffect(() => {
    fetchVueDuJour();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCheckin = async (id: string) => {
    try {
      await checkin(id);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Impossible d\'enregistrer le check-in');
    }
  };

  const handleCheckout = async (id: string) => {
    try {
      await checkout(id);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Impossible d\'enregistrer le check-out');
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {(['DISPONIBLE', 'OCCUPEE', 'NETTOYAGE_EN_COURS', 'MAINTENANCE'] as const).map((s) => {
          const c = chambresParStatut.find((x) => x.statut === s);
          return <StatCard key={s} icon={DoorOpen} theme={s === 'DISPONIBLE' ? 'brand' : s === 'OCCUPEE' ? 'blue' : s === 'NETTOYAGE_EN_COURS' ? 'gold' : 'amber'} label={STATUT_LABEL[s].toUpperCase()} value={String(c?.count ?? 0)} compact />;
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <section className="space-y-3">
          <h2 className="text-sm font-bold tracking-widest" style={{ color: 'var(--color-ink-3)' }}>ARRIVÉES PRÉVUES AUJOURD'HUI</h2>
          <div className="card overflow-x-auto">
            {isLoading ? (
              <div className="p-8 text-center text-sm" style={{ color: 'var(--color-ink-3)' }}>Chargement...</div>
            ) : arrivees.length === 0 ? (
              <EmptyState icon={LogIn} title="Aucune arrivée prévue aujourd'hui" />
            ) : (
              <table className="table-shell w-full">
                <thead><tr><th>Client</th><th>Chambre</th><th></th></tr></thead>
                <tbody>
                  {arrivees.map((r) => (
                    <tr key={r.id}>
                      <td>
                        <p className="font-semibold" style={{ color: 'var(--color-ink)' }}>{r.client.nom}</p>
                        <p className="text-xs" style={{ color: 'var(--color-ink-3)' }}>{r.client.telephone}</p>
                      </td>
                      <td>{r.chambre.typeChambre.nom} — {r.chambre.numero}</td>
                      <td>
                        <button onClick={() => handleCheckin(r.id)} className="btn btn-primary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem' }}>
                          <LogIn className="w-3.5 h-3.5" />
                          Check-in
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-sm font-bold tracking-widest" style={{ color: 'var(--color-ink-3)' }}>DÉPARTS PRÉVUS AUJOURD'HUI</h2>
          <div className="card overflow-x-auto">
            {isLoading ? (
              <div className="p-8 text-center text-sm" style={{ color: 'var(--color-ink-3)' }}>Chargement...</div>
            ) : departs.length === 0 ? (
              <EmptyState icon={LogOut} title="Aucun départ prévu aujourd'hui" />
            ) : (
              <table className="table-shell w-full">
                <thead><tr><th>Client</th><th>Chambre</th><th>Solde dû</th><th></th></tr></thead>
                <tbody>
                  {departs.map((r) => {
                    const totalPaye = r.facture?.paiements.reduce((s, p) => s + Number(p.montant), 0) ?? 0;
                    const solde = r.facture ? Number(r.facture.montantTotal) - totalPaye : 0;
                    return (
                      <tr key={r.id}>
                        <td>
                          <p className="font-semibold" style={{ color: 'var(--color-ink)' }}>{r.client.nom}</p>
                          <p className="text-xs" style={{ color: 'var(--color-ink-3)' }}>{r.client.telephone}</p>
                        </td>
                        <td>{r.chambre.typeChambre.nom} — {r.chambre.numero}</td>
                        <td>
                          {r.facture && (
                            <span className="text-sm font-semibold" style={{ color: solde > 0 ? 'var(--color-danger)' : 'var(--color-success)' }}>
                              {solde.toLocaleString('fr-FR')} {r.facture.devise}
                            </span>
                          )}
                        </td>
                        <td>
                          <button onClick={() => handleCheckout(r.id)} className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem' }}>
                            <LogOut className="w-3.5 h-3.5" />
                            Check-out
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
