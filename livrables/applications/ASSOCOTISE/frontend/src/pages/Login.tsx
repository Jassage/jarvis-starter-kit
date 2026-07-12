import { useState, type FormEvent } from 'react';
import { PiggyBank } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Input } from '../components/ui/Field';

export function Login() {
  const { connecter, erreurCompteInactif } = useAuth();
  const [email, setEmail] = useState('');
  const [motDePasse, setMotDePasse] = useState('');
  const [erreur, setErreur] = useState<string | null>(null);
  const [envoi, setEnvoi] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setErreur(null);
    setEnvoi(true);
    try {
      await connecter(email, motDePasse);
    } catch {
      setErreur('Email ou mot de passe incorrect.');
    } finally {
      setEnvoi(false);
    }
  }

  return (
    <div className="flex min-h-svh items-center justify-center bg-gradient-to-br from-[var(--color-brand-dark)] to-[var(--color-brand)] p-4">
      <div className="w-full max-w-sm rounded-[var(--radius-card)] bg-[var(--color-surface)] p-8 shadow-[var(--shadow-card)]">
        <div className="mb-6 flex flex-col items-center gap-2 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--color-brand)] text-white">
            <PiggyBank size={24} />
          </div>
          <h1 className="text-lg font-semibold text-[var(--color-ink)]">AssoCotise</h1>
          <p className="text-sm text-[var(--color-muted)]">Gestion financière associative</p>
        </div>

        {erreurCompteInactif && (
          <p className="mb-4 rounded-lg bg-[var(--color-danger-bg)] px-3 py-2 text-sm text-[var(--color-danger)]">
            Ce compte a été désactivé. Contacte le responsable finances.
          </p>
        )}
        {erreur && (
          <p className="mb-4 rounded-lg bg-[var(--color-danger-bg)] px-3 py-2 text-sm text-[var(--color-danger)]">
            {erreur}
          </p>
        )}

        <form onSubmit={onSubmit}>
          <div className="mb-4">
            <label className="mb-1.5 block text-sm font-medium text-[var(--color-ink)]">Email</label>
            <Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="mb-6">
            <label className="mb-1.5 block text-sm font-medium text-[var(--color-ink)]">Mot de passe</label>
            <Input
              type="password"
              required
              value={motDePasse}
              onChange={(e) => setMotDePasse(e.target.value)}
            />
          </div>
          <button
            type="submit"
            disabled={envoi}
            className="w-full rounded-lg bg-[var(--color-brand)] py-2.5 text-sm font-medium text-white transition hover:bg-[var(--color-brand-dark)] disabled:opacity-60"
          >
            {envoi ? 'Connexion…' : 'Se connecter'}
          </button>
        </form>
      </div>
    </div>
  );
}
