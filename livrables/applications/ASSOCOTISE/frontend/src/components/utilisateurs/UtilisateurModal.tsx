import { useState, type FormEvent } from 'react';
import { Modal } from '../ui/Modal';
import { Field, Input, Select } from '../ui/Field';
import { creerCompteSecretaire, modifierUtilisateur } from '../../services/users.service';
import { useAuth } from '../../contexts/AuthContext';
import { LABEL_ROLE, type Role, type UtilisateurBureau } from '../../types';

const ROLES_CREABLES: Role[] = ['secretaire', 'tresoriere', 'membre_comite', 'responsable_finances'];

export function UtilisateurModal({
  open,
  onClose,
  utilisateur,
}: {
  open: boolean;
  onClose: () => void;
  /** Présent = édition d'un compte existant (nom + rôle uniquement) ; absent = création. */
  utilisateur?: UtilisateurBureau;
}) {
  const { profil } = useAuth();
  const [nom, setNom] = useState(utilisateur?.nom ?? '');
  const [email, setEmail] = useState('');
  const [motDePasse, setMotDePasse] = useState('');
  const [role, setRole] = useState<Role>(utilisateur?.role ?? 'secretaire');
  const [erreur, setErreur] = useState<string | null>(null);
  const [envoi, setEnvoi] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setErreur(null);

    if (utilisateur) {
      setEnvoi(true);
      try {
        await modifierUtilisateur(utilisateur.id, { nom, role });
        onClose();
      } catch {
        setErreur('Impossible de modifier ce compte.');
      } finally {
        setEnvoi(false);
      }
      return;
    }

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
    <Modal open={open} onClose={onClose} title={utilisateur ? 'Modifier le compte' : 'Nouveau compte du bureau'}>
      <form onSubmit={onSubmit}>
        {erreur && (
          <p className="mb-4 rounded-lg bg-[var(--color-danger-bg)] px-3 py-2 text-sm text-[var(--color-danger)]">
            {erreur}
          </p>
        )}
        <Field label="Nom complet" required>
          <Input required value={nom} onChange={(e) => setNom(e.target.value)} />
        </Field>
        {!utilisateur && (
          <>
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
          </>
        )}
        <Field label="Rôle" required>
          <Select value={role} onChange={(e) => setRole(e.target.value as Role)}>
            {ROLES_CREABLES.map((r) => (
              <option key={r} value={r}>
                {LABEL_ROLE[r]}
              </option>
            ))}
          </Select>
        </Field>
        <button
          type="submit"
          disabled={envoi}
          className="w-full rounded-lg bg-[var(--color-brand)] py-2.5 text-sm font-medium text-white transition hover:bg-[var(--color-brand-dark)] disabled:opacity-60"
        >
          {envoi ? 'Enregistrement…' : utilisateur ? 'Enregistrer' : 'Créer le compte'}
        </button>
      </form>
    </Modal>
  );
}
