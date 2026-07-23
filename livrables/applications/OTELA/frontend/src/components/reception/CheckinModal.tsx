'use client';
import { useRef, useState } from 'react';
import { Eraser } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import SignaturePad, { SignaturePadHandle } from './SignaturePad';
import { useReceptionStore } from '@/stores/receptionStore';
import type { ReservationDuJour } from '@/stores/receptionStore';

export default function CheckinModal({ reservation, onClose }: { reservation: ReservationDuJour | null; onClose: () => void }) {
  const { checkin } = useReceptionStore();
  const padRef = useRef<SignaturePadHandle>(null);
  const [aSigne, setASigne] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!reservation) return null;

  const effacer = () => padRef.current?.effacer();

  const confirmer = async () => {
    setError('');
    const blob = await padRef.current?.obtenirBlob();
    if (!blob) {
      setError('La signature du client est requise pour finaliser le check-in.');
      return;
    }
    setSubmitting(true);
    try {
      await checkin(reservation.id, blob);
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Impossible d\'enregistrer le check-in');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal open={!!reservation} onClose={onClose} title="Check-in — signature client" maxWidth={520}>
      <div className="space-y-4">
        <div className="p-3 rounded-xl" style={{ background: 'var(--color-surface-2)' }}>
          <p className="text-sm font-semibold" style={{ color: 'var(--color-ink)' }}>{reservation.client.nom}</p>
          <p className="text-xs" style={{ color: 'var(--color-ink-3)' }}>{reservation.chambre.typeChambre.nom} — {reservation.chambre.numero}</p>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-semibold" style={{ color: 'var(--color-ink-2)' }}>Signature du client</label>
            <button type="button" onClick={effacer} className="text-xs font-semibold flex items-center gap-1" style={{ color: 'var(--color-ink-3)' }}>
              <Eraser className="w-3.5 h-3.5" /> Effacer
            </button>
          </div>
          <SignaturePad ref={padRef} onDessinerChange={setASigne} />
          {!aSigne && <p className="text-xs mt-1.5" style={{ color: 'var(--color-ink-3)' }}>Faites signer le client dans le cadre ci-dessus.</p>}
        </div>

        {error && <div className="p-3 rounded-xl text-sm" style={{ background: 'var(--color-danger-soft)', color: 'var(--color-danger)' }}>{error}</div>}

        <button onClick={confirmer} disabled={!aSigne || submitting} className="btn btn-primary w-full">
          {submitting ? 'Enregistrement...' : 'Confirmer le check-in'}
        </button>
      </div>
    </Modal>
  );
}
