import { useMemo, useState, type FormEvent } from 'react';
import { ArrowUp, ArrowDown } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Field, Input, Select } from '../ui/Field';
import { creerCycleTontine } from '../../services/tontine.service';
import { useAuth } from '../../contexts/AuthContext';
import type { Membre, MethodeOrdreTontine } from '../../types';

export function NouveauCycleModal({
  open,
  onClose,
  membres,
}: {
  open: boolean;
  onClose: () => void;
  membres: Membre[];
}) {
  const { profil } = useAuth();
  const [nom, setNom] = useState('');
  const [dateDebut, setDateDebut] = useState(new Date().toISOString().slice(0, 10));
  const [montantCotisation, setMontantCotisation] = useState(500);
  const [methodeOrdre, setMethodeOrdre] = useState<MethodeOrdreTontine>('fixe');
  const [selection, setSelection] = useState<string[]>([]);
  const [erreur, setErreur] = useState<string | null>(null);
  const [envoi, setEnvoi] = useState(false);

  const membresActifs = useMemo(() => membres.filter((m) => m.statut === 'actif'), [membres]);
  const membresSelectionnes = useMemo(
    () => selection.map((id) => membresActifs.find((m) => m.id === id)!).filter(Boolean),
    [selection, membresActifs]
  );

  function toggleMembre(id: string) {
    setSelection((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  function deplacer(index: number, direction: -1 | 1) {
    setSelection((prev) => {
      const copie = [...prev];
      const cible = index + direction;
      if (cible < 0 || cible >= copie.length) return prev;
      [copie[index], copie[cible]] = [copie[cible], copie[index]];
      return copie;
    });
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setErreur(null);
    if (selection.length < 2) {
      setErreur('Sélectionne au moins 2 membres participants.');
      return;
    }
    if (!profil) return;
    setEnvoi(true);
    try {
      await creerCycleTontine({
        nom,
        dateDebut,
        montantCotisation,
        methodeOrdre,
        membres: membresSelectionnes,
        creePar: profil.id,
      });
      onClose();
      setSelection([]);
      setNom('');
    } finally {
      setEnvoi(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Nouveau cycle de tontine" maxWidth="max-w-2xl">
      <form onSubmit={onSubmit}>
        {erreur && (
          <p className="mb-4 rounded-lg bg-[var(--color-danger-bg)] px-3 py-2 text-sm text-[var(--color-danger)]">
            {erreur}
          </p>
        )}
        <div className="grid grid-cols-2 gap-4">
          <Field label="Nom du cycle" required>
            <Input required value={nom} onChange={(e) => setNom(e.target.value)} placeholder="Sol 2026-A" />
          </Field>
          <Field label="Date de début" required>
            <Input type="date" required value={dateDebut} onChange={(e) => setDateDebut(e.target.value)} />
          </Field>
          <Field label="Cotisation fixe par tour (HTG)" required>
            <Input
              type="number"
              min={1}
              required
              value={montantCotisation}
              onChange={(e) => setMontantCotisation(Number(e.target.value))}
            />
          </Field>
          <Field label="Méthode d'ordre" required>
            <Select value={methodeOrdre} onChange={(e) => setMethodeOrdre(e.target.value as MethodeOrdreTontine)}>
              <option value="fixe">Ordre fixe (manuel)</option>
              <option value="aleatoire">Tirage au sort</option>
              <option value="anciennete">Ancienneté</option>
            </Select>
          </Field>
        </div>

        <Field label={`Participants (${selection.length} sélectionné(s))`} required>
          <div className="max-h-40 overflow-y-auto rounded-lg border border-[var(--color-border)] p-2">
            {membresActifs.map((m) => (
              <label key={m.id} className="flex items-center gap-2 rounded px-2 py-1 text-sm hover:bg-[var(--color-bg)]">
                <input type="checkbox" checked={selection.includes(m.id)} onChange={() => toggleMembre(m.id)} />
                {m.nom}
              </label>
            ))}
          </div>
        </Field>

        {methodeOrdre === 'fixe' && membresSelectionnes.length > 0 && (
          <Field label="Ordre de passage (le premier reçoit au 1er tour)">
            <ul className="space-y-1">
              {membresSelectionnes.map((m, index) => (
                <li
                  key={m.id}
                  className="flex items-center justify-between rounded-lg border border-[var(--color-border)] px-3 py-1.5 text-sm"
                >
                  <span>
                    {index + 1}. {m.nom}
                  </span>
                  <span className="flex gap-1">
                    <button type="button" onClick={() => deplacer(index, -1)} className="text-[var(--color-muted)] hover:text-[var(--color-ink)]">
                      <ArrowUp size={14} />
                    </button>
                    <button type="button" onClick={() => deplacer(index, 1)} className="text-[var(--color-muted)] hover:text-[var(--color-ink)]">
                      <ArrowDown size={14} />
                    </button>
                  </span>
                </li>
              ))}
            </ul>
          </Field>
        )}

        <button
          type="submit"
          disabled={envoi}
          className="w-full rounded-lg bg-[var(--color-brand)] py-2.5 text-sm font-medium text-white transition hover:bg-[var(--color-brand-dark)] disabled:opacity-60"
        >
          {envoi ? 'Création…' : 'Créer le cycle'}
        </button>
      </form>
    </Modal>
  );
}
