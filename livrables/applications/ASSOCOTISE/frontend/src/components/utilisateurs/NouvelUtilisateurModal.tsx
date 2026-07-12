import { useState, type FormEvent } from 'react';
import { Modal } from '../ui/Modal';
import { Field, Input, Select } from '../ui/Field';
import { creerCompteSecretaire } from '../../services/users.service';
import { useAuth } from '../../contexts/AuthContext';
import type { Role } from '../../types';

export function NouvelUtilisateurModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { profil } = useAuth();
  const [nom, setNom] = useState('');
  const [email, setEmail] = useState('');
  const [motDePasse, setMotDePasse] = useState('');
  const [role, setRole] = useState<Role>('secretaire');
  const [erreur, setErreur] = useState<string | null>(null);
  const [envoi, setEnvoi] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setErreur(null);
    if (motDePasse.length < 6) {
      setErreur('Le mot de passe doit contenir au moins 6 caractères.');
      return;
    }
    if (!profil) return;
    setEnvoi(true);
    try {
      await creerCompteSecretaire({ nom, email, motDePasse, role, creePar: profil.id });
      onClose();
      setNom('');
      setEmail('');
      setMotDePasse('');
    } catch {
      setErreur('Impossible de créer ce compte (email déjà utilisé ?).');
    } finally {
      setEnvoi(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Nouveau compte du bureau">
      <form onSubmit={onSubmit}>
        {erreur && (
          <p className="mb-4 rounded-lg bg-[var(--color-danger-bg)] px-3 py-2 text-sm text-[var(--color-danger)]">
            {erreur}
          </p>
        )}
        <Field label="Nom complet" required>
          <Input required value={nom} onChange={(e) => setNom(e.target.value)} />
        </Field>
        <Field label="Email" required>
          <Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </Field>
        <Field label="Mot de passe temporaire" required>
          <Input
            type="password"
            required
            minLength={6}
            value={motDePasse}
            onChange={(e) => setMotDePasse(e.target.value)}
          />
        </Field>
        <Field label="Rôle" required>
          <Select value={role} onChange={(e) => setRole(e.target.value as Role)}>
            <option value="secretaire">Secrétaire</option>
            <option value="responsable_finances">Responsable Finances</option>
          </Select>
        </Field>
        <button
          type="submit"
          disabled={envoi}
          className="w-full rounded-lg bg-[var(--color-brand)] py-2.5 text-sm font-medium text-white transition hover:bg-[var(--color-brand-dark)] disabled:opacity-60"
        >
          {envoi ? 'Création…' : 'Créer le compte'}
        </button>
      </form>
    </Modal>
  );
}
