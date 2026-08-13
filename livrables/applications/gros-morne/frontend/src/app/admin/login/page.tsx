'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { MapPin, Loader2 } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

export default function AdminLoginPage() {
  const router = useRouter();
  const login = useAuthStore((s) => s.login);
  const isLoading = useAuthStore((s) => s.isLoading);
  const [email, setEmail] = useState('');
  const [motDePasse, setMotDePasse] = useState('');
  const [erreur, setErreur] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErreur(null);
    try {
      await login(email, motDePasse);
      router.push('/admin');
    } catch {
      setErreur('Email ou mot de passe incorrect.');
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'var(--color-bg)' }}>
      <div className="card w-full max-w-sm p-8">
        <div className="flex flex-col items-center mb-6">
          <div className="w-12 h-12 rounded-full flex items-center justify-center mb-3" style={{ background: 'var(--gradient-brand)' }}>
            <MapPin className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-lg font-extrabold" style={{ color: 'var(--color-ink)' }}>Administration</h1>
          <p className="text-sm" style={{ color: 'var(--color-ink-3)' }}>Portail de Gros-Morne</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="text-xs font-bold block mb-1.5" style={{ color: 'var(--color-ink-2)' }}>
              Email
            </label>
            <input
              type="email"
              required
              className="input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="username"
            />
          </div>
          <div>
            <label className="text-xs font-bold block mb-1.5" style={{ color: 'var(--color-ink-2)' }}>
              Mot de passe
            </label>
            <input
              type="password"
              required
              className="input"
              value={motDePasse}
              onChange={(e) => setMotDePasse(e.target.value)}
              autoComplete="current-password"
            />
          </div>

          {erreur && (
            <p className="text-sm" style={{ color: 'var(--color-danger)' }}>{erreur}</p>
          )}

          <button type="submit" disabled={isLoading} className="btn btn-primary mt-2">
            {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
            Se connecter
          </button>
        </form>
      </div>
    </div>
  );
}
