import { useState, type FormEvent } from 'react';
import { Modal } from '../ui/Modal';
import { Field, Input, Select } from '../ui/Field';
import { creerDepense, uploaderJustificatif } from '../../services/depenses.service';
import { useAuth } from '../../contexts/AuthContext';
import type { CategorieDepense } from '../../types';

const labelCategorie: Record<CategorieDepense, string> = {
  materiel: 'Matériel',
  logistique: 'Logistique',
  administratif: 'Administratif',
  projet_business: 'Projet business',
  autre: 'Autre',
};

export function DepenseModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { profil } = useAuth();
  const [description, setDescription] = useState('');
  const [categorie, setCategorie] = useState<CategorieDepense>('materiel');
  const [montant, setMontant] = useState(0);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [fichier, setFichier] = useState<File | null>(null);
  const [envoi, setEnvoi] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!profil) return;
    setEnvoi(true);
    try {
      const justificatifUrl = fichier ? await uploaderJustificatif(fichier) : undefined;
      await creerDepense({
        description,
        categorie,
        montant,
        date,
        justificatifUrl,
        saisiPar: profil.id,
      });
      onClose();
    } finally {
      setEnvoi(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Nouvelle dépense">
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
        <Field label="Justificatif (image ou PDF)">
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
