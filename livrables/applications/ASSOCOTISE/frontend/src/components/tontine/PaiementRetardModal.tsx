import { useState, type FormEvent } from 'react';
import { Modal } from '../ui/Modal';
import { Field, Input } from '../ui/Field';
import { saisirPaiementTontine } from '../../services/tontine.service';
import { useAuth } from '../../contexts/AuthContext';
import { formatMontant } from '../../lib/format';

export function PaiementRetardModal({
  open,
  onClose,
  cycleId,
  periode,
  memberId,
  membreNom,
  montantAttendu,
}: {
  open: boolean;
  onClose: () => void;
  cycleId: string;
  periode: number;
  memberId: string;
  membreNom: string;
  montantAttendu: number;
}) {
  const { profil } = useAuth();
  const [montantVerse, setMontantVerse] = useState(0);
  const [envoi, setEnvoi] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!profil) return;
    setEnvoi(true);
    try {
      await saisirPaiementTontine({
        cycleId,
        periode,
        memberId,
        montant: montantVerse,
        date: new Date().toISOString().slice(0, 10),
        statut: 'retard',
        saisiPar: profil.id,
      });
      onClose();
    } finally {
      setEnvoi(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={`Marquer ${membreNom} en retard`}>
      <form onSubmit={onSubmit}>
        <p className="mb-4 text-sm text-[var(--color-muted)]">
          Cotisation attendue : {formatMontant(montantAttendu)}. Indique le montant déjà versé, s'il y en a un — le
          solde dû sera calculé automatiquement.
        </p>
        <Field label="Montant déjà versé (HTG)">
          <Input
            type="number"
            min={0}
            max={montantAttendu}
            value={montantVerse}
            onChange={(e) => setMontantVerse(Number(e.target.value))}
          />
        </Field>
        <p className="mb-4 text-sm font-medium text-[var(--color-danger)]">
          Solde dû : {formatMontant(Math.max(montantAttendu - montantVerse, 0))}
        </p>
        <button
          type="submit"
          disabled={envoi}
          className="w-full rounded-lg bg-[var(--color-danger)] py-2.5 text-sm font-medium text-white transition disabled:opacity-60"
        >
          {envoi ? 'Enregistrement…' : 'Confirmer le retard'}
        </button>
      </form>
    </Modal>
  );
}
