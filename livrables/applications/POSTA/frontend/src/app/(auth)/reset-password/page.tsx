'use client';

import { useState, FormEvent, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { api, apiErrorMessage } from '@/lib/api';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';

  const [motDePasse, setMotDePasse] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [erreur, setErreur] = useState<string | null>(null);
  const [envoi, setEnvoi] = useState(false);
  const [succes, setSucces] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setErreur(null);

    if (motDePasse !== confirmation) {
      setErreur('Les mots de passe ne correspondent pas');
      return;
    }

    setEnvoi(true);
    try {
      await api.post('/auth/reset-password', { token, motDePasse });
      setSucces(true);
      setTimeout(() => router.push('/login'), 2000);
    } catch (err) {
      setErreur(apiErrorMessage(err, 'Lien invalide ou expiré'));
    } finally {
      setEnvoi(false);
    }
  }

  if (!token) {
    return (
      <main className="flex min-h-screen items-center justify-center p-8">
        <div className="flex w-full max-w-sm flex-col gap-4 text-center">
          <p className="text-sm text-red-600">Lien de réinitialisation invalide.</p>
          <Link href="/forgot-password" className="text-sm underline underline-offset-2">
            Demander un nouveau lien
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center p-8">
      <form onSubmit={onSubmit} className="flex w-full max-w-sm flex-col gap-4">
        <h1 className="text-xl font-semibold">Choisir un mot de passe</h1>
        {succes ? (
          <p className="rounded bg-green-50 px-3 py-2 text-sm text-green-800">
            Mot de passe mis à jour, redirection vers la connexion...
          </p>
        ) : (
          <>
            <input
              type="password"
              placeholder="Nouveau mot de passe (min. 8 caractères)"
              value={motDePasse}
              onChange={(e) => setMotDePasse(e.target.value)}
              className="rounded border px-3 py-2"
              required
              minLength={8}
            />
            <input
              type="password"
              placeholder="Confirmer le mot de passe"
              value={confirmation}
              onChange={(e) => setConfirmation(e.target.value)}
              className="rounded border px-3 py-2"
              required
              minLength={8}
            />
            {erreur && <p className="text-sm text-red-600">{erreur}</p>}
            <button
              type="submit"
              disabled={envoi}
              className="rounded bg-neutral-900 px-3 py-2 text-white disabled:opacity-50"
            >
              {envoi ? 'Enregistrement...' : 'Enregistrer le mot de passe'}
            </button>
          </>
        )}
      </form>
    </main>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordForm />
    </Suspense>
  );
}
