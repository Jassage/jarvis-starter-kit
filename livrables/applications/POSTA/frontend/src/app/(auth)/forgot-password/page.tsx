'use client';

import { useState, FormEvent } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [envoi, setEnvoi] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setEnvoi(true);
    try {
      const { data } = await api.post('/auth/forgot-password', { email });
      setMessage(data.message);
    } catch {
      setMessage('Si un compte existe avec cet email, un lien de réinitialisation a été envoyé');
    } finally {
      setEnvoi(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center p-8">
      <form onSubmit={onSubmit} className="flex w-full max-w-sm flex-col gap-4">
        <h1 className="text-xl font-semibold">Mot de passe oublié</h1>
        <p className="text-sm text-neutral-500">
          Entrez votre email, un lien de réinitialisation vous sera envoyé s&apos;il correspond à
          un compte existant.
        </p>
        {message ? (
          <p className="rounded bg-green-50 px-3 py-2 text-sm text-green-800">{message}</p>
        ) : (
          <>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded border px-3 py-2"
              required
            />
            <button
              type="submit"
              disabled={envoi}
              className="rounded bg-neutral-900 px-3 py-2 text-white disabled:opacity-50"
            >
              {envoi ? 'Envoi...' : 'Envoyer le lien'}
            </button>
          </>
        )}
        <Link href="/login" className="text-center text-sm text-neutral-500 underline underline-offset-2">
          Retour à la connexion
        </Link>
      </form>
    </main>
  );
}
