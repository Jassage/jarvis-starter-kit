import { useState, type FormEvent } from 'react';
import { FileText } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Field, Input, Select } from '../ui/Field';
import { creerDepense, modifierDepense, uploaderJustificatif } from '../../services/depenses.service';
import { useAuth } from '../../contexts/AuthContext';
import type { CategorieDepense, Depense } from '../../types';

const labelCategorie: Record<CategorieDepense, string> = {
  materiel: 'Matériel',
  logistique: 'Logistique',
  administratif: 'Administratif',
  projet_business: 'Projet business',
  autre: 'Autre',
};

export function DepenseModal({
  open,
  onClose,
  depense,
}: {
  open: boolean;
  onClose: () => void;
  /** Dépense à modifier ; si absent, le formulaire crée une nouvelle dépense. */
  depense?: Depense;
}) {
  const { profil } = useAuth();
  const modification = !!depense;
  const [description, setDescription] = useState(depense?.description ?? '');
  const [categorie, setCategorie] = useState<CategorieDepense>(depense?.categorie ?? 'materiel');
  const [montant, setMontant] = useState(depense?.montant ?? 0);
  const [date, setDate] = useState(depense?.date ?? new Date().toISOString().slice(0, 10));
  const [fichier, setFichier] = useState<File | null>(null);
  const [envoi, setEnvoi] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!profil) return;
    setEnvoi(true);
    try {
      const justificatifUrl = fichier ? await uploaderJustificatif(fichier) : depense?.justificatifUrl;
      if (modification && depense) {
        await modifierDepense(depense.id, { description, categorie, montant, date, justificatifUrl });
      } else {
        await creerDepense({ description, categorie, montant, date, justificatifUrl, saisiPar: profil.id });
      }
      onClose();
    } finally {
      setEnvoi(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={modification ? 'Modifier la dépense' : 'Nouvelle dépense'}>
      <form onSubmit={onSubmit}>
        <Field label="Description" required>
          <Input required value={description} onChange={(e) => setDescription(e.target.value)} />
        </Field>
        <Field label="Catégorie" required>
          <Select value={categorie} onChange={(e) => setCategorie(e.target.value as CategorieDepense)}>
            {Object.entries(labelCategorie).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Montant (HTG)" required>
          <Input
            type="number"
            min={0}
            required
            value={montant}
            onChange={(e) => setMontant(Number(e.target.value))}
          />
        </Field>
        <Field label="Date" required>
          <Input type="date" required value={date} onChange={(e) => setDate(e.target.value)} />
        </Field>
        <Field label={modification ? 'Remplacer le justificatif (image ou PDF)' : 'Justificatif (image ou PDF)'}>
          {depense?.justificatifUrl && (
            <a
              href={depense.justificatifUrl}
              target="_blank"
              rel="noreferrer"
              className="mb-2 flex items-center gap-1 text-xs text-[var(--color-brand)] hover:underline"
            >
              <FileText size={14} /> Voir le justificatif actuel
            </a>
          )}
          <input
            type="file"
            accept="image/*,application/pdf"
            onChange={(e) => setFichier(e.target.files?.[0] ?? null)}
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
