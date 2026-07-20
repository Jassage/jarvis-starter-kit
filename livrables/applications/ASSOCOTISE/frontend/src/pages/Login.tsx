import { useState, type FormEvent } from 'react';
import { Navigate } from 'react-router-dom';
import { PiggyBank, Moon, Sun } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { Input } from '../components/ui/Field';

export function Login() {
  const { connecter, erreurCompteInactif, profil } = useAuth();
  const { theme, basculer } = useTheme();
  const [email, setEmail] = useState('');
  const [motDePasse, setMotDePasse] = useState('');
  const [erreur, setErreur] = useState<string | null>(null);
  const [envoi, setEnvoi] = useState(false);

  if (profil) return <Navigate to="/" replace />;

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
    <div className="relative flex min-h-svh items-center justify-center overflow-hidden bg-gradient-to-br from-[var(--color-brand-dark)] via-[var(--color-brand)] to-[var(--color-brand-dark)] p-4">
      <div
        className="pointer-events-none absolute -left-24 -top-24 h-80 w-80 rounded-full opacity-40 blur-3xl"
        style={{ background: 'var(--color-gold)' }}
      />
      <div
        className="pointer-events-none absolute -bottom-32 -right-16 h-96 w-96 rounded-full opacity-30 blur-3xl"
        style={{ background: '#ffffff' }}
      />

      <button
        onClick={basculer}
        className="absolute right-4 top-4 rounded-lg border border-white/25 bg-white/10 p-2 text-white backdrop-blur-md transition hover:bg-white/20"
        title={theme === 'dark' ? 'Passer en mode clair' : 'Passer en mode sombre'}
      >
        {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
      </button>

      <div className="relative w-full max-w-sm rounded-[var(--radius-card)] border border-white/20 bg-white/10 p-8 shadow-2xl backdrop-blur-2xl">
        <div className="mb-6 flex flex-col items-center gap-2 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/90 text-[var(--color-brand-dark)] shadow-lg">
            <PiggyBank size={24} />
          </div>
          <h1 className="text-lg font-semibold text-white">AssoCotise</h1>
          <p className="text-sm text-white/70">Gestion financière associative</p>
        </div>

        {erreurCompteInactif && (
          <p className="mb-4 rounded-lg border border-red-300/30 bg-red-500/20 px-3 py-2 text-sm text-white">
            Ce compte a été désactivé. Contacte le responsable finances.
          </p>
        )}
        {erreur && (
          <p className="mb-4 rounded-lg border border-red-300/30 bg-red-500/20 px-3 py-2 text-sm text-white">{erreur}</p>
        )}

        <form onSubmit={onSubmit}>
          <div className="mb-4">
            <label className="mb-1.5 block text-sm font-medium text-white/90">Email</label>
            <Input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="border-white/25 bg-white/10 text-white placeholder-white/40 focus:border-white/60"
            />
          </div>
          <div className="mb-6">
            <label className="mb-1.5 block text-sm font-medium text-white/90">Mot de passe</label>
            <Input
              type="password"
              required
              value={motDePasse}
              onChange={(e) => setMotDePasse(e.target.value)}
              className="border-white/25 bg-white/10 text-white placeholder-white/40 focus:border-white/60"
            />
          </div>
          <button
            type="submit"
            disabled={envoi}
            className="w-full rounded-lg bg-white py-2.5 text-sm font-semibold text-[var(--color-brand-dark)] shadow-lg transition hover:bg-white/90 disabled:opacity-60"
          >
            {envoi ? 'Connexion…' : 'Se connecter'}
          </button>
        </form>
      </div>
    </div>
  );
}
