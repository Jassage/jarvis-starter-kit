'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [motDePasse, setMotDePasse] = useState('');
  const [erreur, setErreur] = useState<string | null>(null);
  const [chargement, setChargement] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setErreur(null);
    setChargement(true);
    try {
      await api.post('/auth/login', { email, motDePasse });
      router.push('/app');
    } catch {
      setErreur('Email ou mot de passe incorrect');
    } finally {
      setChargement(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center p-8">
      <form onSubmit={onSubmit} className="flex w-full max-w-sm flex-col gap-4">
        <Link href="/" className="text-sm text-neutral-400 underline underline-offset-2">
          ← Retour à l&apos;accueil
        </Link>
        <h1 className="text-xl font-semibold">Connexion POSTA</h1>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="rounded border px-3 py-2"
          required
        />
        <input
          type="password"
          placeholder="Mot de passe"
          value={motDePasse}
          onChange={(e) => setMotDePasse(e.target.value)}
          className="rounded border px-3 py-2"
          required
        />
        {erreur && <p className="text-sm text-red-600">{erreur}</p>}
        <button
          type="submit"
          disabled={chargement}
          className="rounded bg-neutral-900 px-3 py-2 text-white disabled:opacity-50"
        >
          {chargement ? 'Connexion...' : 'Se connecter'}
        </button>
        <Link
          href="/forgot-password"
          className="text-center text-sm text-neutral-500 underline underline-offset-2"
        >
          Mot de passe oublié ?
        </Link>
      </form>
    </main>
  );
}
