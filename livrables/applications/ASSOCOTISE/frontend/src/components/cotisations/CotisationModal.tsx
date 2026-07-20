import { useState, type FormEvent } from 'react';
import { FileText } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Field, Input, Select, Textarea } from '../ui/Field';
import { saisirCotisation, uploaderPreuveCotisation } from '../../services/cotisations.service';
import { useAuth } from '../../contexts/AuthContext';
import type { Cotisation, Membre, MoyenPaiement } from '../../types';

const MONTANT_MINIMUM = 500;

export function CotisationModal({
  open,
  onClose,
  membres,
  membreParDefaut,
  moisParDefaut,
  valeursActuelles,
}: {
  open: boolean;
  onClose: () => void;
  membres: Membre[];
  membreParDefaut?: string;
  moisParDefaut: string;
  /** Cotisation actuelle du membre pour ce mois, si elle existe : le formulaire est prérempli avec ses valeurs. */
  valeursActuelles?: Cotisation;
}) {
  const { profil } = useAuth();
  const correction = !!valeursActuelles;
  const [memberId, setMemberId] = useState(membreParDefaut ?? '');
  const [mois, setMois] = useState(moisParDefaut);
  const [montant, setMontant] = useState(valeursActuelles?.montant ?? MONTANT_MINIMUM);
  const [date, setDate] = useState(valeursActuelles?.date ?? new Date().toISOString().slice(0, 10));
  const [moyenPaiement, setMoyenPaiement] = useState<MoyenPaiement>(valeursActuelles?.moyenPaiement ?? 'cash');
  const [note, setNote] = useState(valeursActuelles?.note ?? '');
  const [preuve, setPreuve] = useState<File | null>(null);
  const [erreur, setErreur] = useState<string | null>(null);
  const [envoi, setEnvoi] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setErreur(null);
    if (montant < MONTANT_MINIMUM) {
      setErreur(`Le montant minimum est de ${MONTANT_MINIMUM} HTG.`);
      return;
    }
    if (!profil) return;
    setEnvoi(true);
    try {
      const preuveUrl = preuve ? await uploaderPreuveCotisation(preuve) : valeursActuelles?.preuveUrl;
      await saisirCotisation({
        memberId,
        mois,
        montant,
        date,
        moyenPaiement,
        note: note || undefined,
        preuveUrl,
        saisiPar: profil.id,
      });
      onClose();
    } finally {
      setEnvoi(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={correction ? 'Corriger la cotisation' : 'Saisir une cotisation'}>
      <form onSubmit={onSubmit}>
        {erreur && (
          <p className="mb-4 rounded-lg bg-[var(--color-danger-bg)] px-3 py-2 text-sm text-[var(--color-danger)]">
            {erreur}
          </p>
        )}
        {correction && (
          <p className="mb-4 rounded-lg bg-[var(--color-info-bg)] px-3 py-2 text-xs text-[var(--color-info)]">
            Les valeurs actuelles sont préremplies. Enregistrer crée une nouvelle entrée corrective — l'historique
            complet reste consultable sur la fiche du membre.
          </p>
        )}
        <Field label="Membre" required>
          <Select required value={memberId} onChange={(e) => setMemberId(e.target.value)} disabled={!!membreParDefaut}>
            <option value="">Sélectionner…</option>
            {membres.map((m) => (
              <option key={m.id} value={m.id}>
                {m.nom}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Mois concerné" required>
          <Input type="month" required value={mois} onChange={(e) => setMois(e.target.value)} />
        </Field>
        <Field label="Montant payé (HTG)" required>
          <Input
            type="number"
            min={0}
            step="1"
            required
            value={montant}
            onChange={(e) => setMontant(Number(e.target.value))}
          />
          <p className="mt-1 text-xs text-[var(--color-muted)]">Minimum {MONTANT_MINIMUM} HTG.</p>
        </Field>
        <Field label="Date du paiement" required>
          <Input type="date" required value={date} onChange={(e) => setDate(e.target.value)} />
        </Field>
        <Field label="Moyen de paiement" required>
          <Select value={moyenPaiement} onChange={(e) => setMoyenPaiement(e.target.value as MoyenPaiement)}>
            <option value="cash">Cash</option>
            <option value="moncash">MonCash</option>
            <option value="natcash">NatCash</option>
            <option value="virement">Virement</option>
          </Select>
        </Field>
        <Field label="Note">
          <Textarea rows={2} value={note} onChange={(e) => setNote(e.target.value)} />
        </Field>
        <Field label={correction ? 'Remplacer la preuve de paiement (photo ou PDF)' : 'Preuve de paiement (photo ou PDF)'}>
          {valeursActuelles?.preuveUrl && (
            <a
              href={valeursActuelles.preuveUrl}
              target="_blank"
              rel="noreferrer"
              className="mb-2 flex items-center gap-1 text-xs text-[var(--color-brand)] hover:underline"
            >
              <FileText size={14} /> Voir la preuve actuelle
            </a>
          )}
          <input
            type="file"
            accept="image/*,application/pdf"
            onChange={(e) => setPreuve(e.target.files?.[0] ?? null)}
            className="w-full text-sm text-[var(--color-muted)] file:mr-3 file:rounded-lg file:border-0 file:bg-[var(--color-brand-light)] file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-[var(--color-brand-dark)]"
          />
        </Field>
        <button
          type="submit"
          disabled={envoi}
          className="w-full rounded-lg bg-[var(--color-brand)] py-2.5 text-sm font-medium text-white transition hover:bg-[var(--color-brand-dark)] disabled:opacity-60"
        >
          {envoi ? 'Enregistrement…' : 'Enregistrer'}
        </button>
      </form>
    </Modal>
  );
}
