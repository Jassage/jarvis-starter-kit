'use client';
import { useEffect, useState } from 'react';
import { Sparkle, Plus, X, DoorOpen, Receipt } from 'lucide-react';
import { useSpaStore } from '@/stores/spaStore';
import Badge from '@/components/ui/Badge';
import EmptyState from '@/components/ui/EmptyState';
import Modal from '@/components/ui/Modal';
import RendezVousModal from '@/components/spa/RendezVousModal';

const STATUT_TONE: Record<string, 'success' | 'warning' | 'danger'> = {
  CONFIRME: 'success',
  TERMINE: 'warning',
  ANNULE: 'danger',
};

const STATUT_LABEL: Record<string, string> = {
  CONFIRME: 'Confirmé',
  TERMINE: 'Terminé',
  ANNULE: 'Annulé',
};

export default function SpaPage() {
  const { rendezVous, fetchRendezVous, annulerRendezVous, terminerRendezVous } = useSpaStore();
  const [modalOpen, setModalOpen] = useState(false);
  const [clotureId, setClotureId] = useState<string | null>(null);
  const [modeCloture, setModeCloture] = useState<'folio' | 'direct' | null>(null);
  const [chambreNumero, setChambreNumero] = useState('');
  const [methode, setMethode] = useState('ESPECES');
  const [erreur, setErreur] = useState('');

  useEffect(() => {
    fetchRendezVous();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAnnuler = async (id: string) => {
    if (!confirm('Annuler ce rendez-vous ?')) return;
    try {
      await annulerRendezVous(id);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Impossible d\'annuler');
    }
  };

  const ouvrirCloture = (id: string) => {
    setClotureId(id);
    setModeCloture(null);
    setChambreNumero('');
    setErreur('');
  };

  const handleCloturer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clotureId) return;
    setErreur('');
    try {
      if (modeCloture === 'folio') await terminerRendezVous(clotureId, { chambreNumero });
      else await terminerRendezVous(clotureId, { methodePaiement: methode });
      setClotureId(null);
    } catch (err: any) {
      setErreur(err.response?.data?.message || 'Impossible de clôturer ce rendez-vous');
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex justify-end">
        <button onClick={() => setModalOpen(true)} className="btn btn-primary">
          <Plus className="w-4 h-4" />
          Nouveau rendez-vous
        </button>
      </div>

      <div className="card overflow-x-auto">
        {rendezVous.length === 0 ? (
          <EmptyState icon={Sparkle} title="Aucun rendez-vous" hint="Les rendez-vous spa apparaîtront ici." />
        ) : (
          <table className="table-shell w-full">
            <thead><tr><th>Heure</th><th>Client</th><th>Service</th><th>Praticien</th><th>Statut</th><th></th></tr></thead>
            <tbody>
              {rendezVous.map((r) => (
                <tr key={r.id}>
                  <td>{new Date(r.dateHeure).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' })}</td>
                  <td>
                    <p className="font-semibold" style={{ color: 'var(--color-ink)' }}>{r.client.nom}</p>
                    <p className="text-xs" style={{ color: 'var(--color-ink-3)' }}>{r.client.telephone}</p>
                  </td>
                  <td>{r.serviceSpa.nom}</td>
                  <td>{r.praticien.nom}</td>
                  <td><Badge tone={STATUT_TONE[r.statut]}>{STATUT_LABEL[r.statut]}</Badge></td>
                  <td>
                    {r.statut === 'CONFIRME' && (
                      <div className="flex items-center gap-3">
                        <button onClick={() => ouvrirCloture(r.id)} className="text-xs font-semibold flex items-center gap-1" style={{ color: 'var(--color-primary-2)' }}>
                          <Receipt className="w-3.5 h-3.5" />
                          Terminer
                        </button>
                        <button onClick={() => handleAnnuler(r.id)} className="text-xs font-semibold flex items-center gap-1" style={{ color: 'var(--color-danger)' }}>
                          <X className="w-3.5 h-3.5" />
                          Annuler
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <RendezVousModal open={modalOpen} onClose={() => setModalOpen(false)} />

      <Modal open={clotureId !== null} onClose={() => setClotureId(null)} title="Clôturer le rendez-vous" maxWidth={420}>
        <div className="space-y-3">
          <div className="flex gap-2">
            <button onClick={() => setModeCloture('folio')} className={`btn ${modeCloture === 'folio' ? 'btn-primary' : 'btn-secondary'}`} style={{ flex: 1 }}>
              <DoorOpen className="w-4 h-4" />
              Ajouter au folio
            </button>
            <button onClick={() => setModeCloture('direct')} className={`btn ${modeCloture === 'direct' ? 'btn-primary' : 'btn-secondary'}`} style={{ flex: 1 }}>
              <Receipt className="w-4 h-4" />
              Paiement direct
            </button>
          </div>

          {modeCloture && (
            <form onSubmit={handleCloturer} className="flex gap-2">
              {modeCloture === 'folio' ? (
                <input required placeholder="Numéro de chambre" className="input" value={chambreNumero} onChange={(e) => setChambreNumero(e.target.value)} />
              ) : (
                <select className="input" value={methode} onChange={(e) => setMethode(e.target.value)}>
                  <option value="ESPECES">Espèces</option>
                  <option value="CARTE">Carte</option>
                  <option value="MONCASH">MonCash</option>
                  <option value="AUTRE">Autre</option>
                </select>
              )}
              <button type="submit" className="btn btn-primary">Confirmer</button>
            </form>
          )}
          {erreur && <div className="p-2.5 rounded-xl text-xs" style={{ background: 'var(--color-danger-soft)', color: 'var(--color-danger)' }}>{erreur}</div>}
        </div>
      </Modal>
    </div>
  );
}
