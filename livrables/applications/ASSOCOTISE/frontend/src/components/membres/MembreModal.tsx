import { useState, type FormEvent } from 'react';
import { Modal } from '../ui/Modal';
import { Field, Input, Select } from '../ui/Field';
import { creerMembre, modifierMembre } from '../../services/membres.service';
import type { Membre } from '../../types';

export function MembreModal({
  open,
  onClose,
  membre,
}: {
  open: boolean;
  onClose: () => void;
  membre?: Membre;
}) {
  const [nom, setNom] = useState(membre?.nom ?? '');
  const [telephone, setTelephone] = useState(membre?.telephone ?? '');
  const [email, setEmail] = useState(membre?.email ?? '');
  const [dateAdhesion, setDateAdhesion] = useState(
    membre?.dateAdhesion ?? new Date().toISOString().slice(0, 10)
  );
  const [statut, setStatut] = useState(membre?.statut ?? 'actif');
  const [envoi, setEnvoi] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setEnvoi(true);
    try {
      if (membre) {
        await modifierMembre(membre.id, { nom, telephone, email: email || undefined, dateAdhesion, statut });
      } else {
        await creerMembre({ nom, telephone, email: email || undefined, dateAdhesion, statut });
      }
      onClose();
    } finally {
      setEnvoi(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={membre ? 'Modifier le membre' : 'Nouveau membre'}>
      <form onSubmit={onSubmit}>
        <Field label="Nom complet" required>
          <Input required value={nom} onChange={(e) => setNom(e.target.value)} />
        </Field>
        <Field label="Téléphone" required>
          <Input required value={telephone} onChange={(e) => setTelephone(e.target.value)} />
        </Field>
        <Field label="Email">
          <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </Field>
        <Field label="Date d'adhésion" required>
          <Input
            type="date"
            required
            value={dateAdhesion}
            onChange={(e) => setDateAdhesion(e.target.value)}
          />
        </Field>
        {membre && (
          <Field label="Statut">
            <Select value={statut} onChange={(e) => setStatut(e.target.value as Membre['statut'])}>
              <option value="actif">Actif</option>
              <option value="inactif">Inactif</option>
            </Select>
          </Field>
        )}
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
