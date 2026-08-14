'use client';
import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Tv, KeyRound, CheckCircle2 } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Consommation d'un lien de réinitialisation généré par un administrateur. Page
// publique : celui qui arrive ici est justement quelqu'un qui ne peut pas se connecter.
function FormulaireReinitialisation() {
  const router = useRouter();
  const token = useSearchParams().get('token') ?? '';

  const [motDePasse, setMotDePasse] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [erreur, setErreur] = useState('');
  const [fait, setFait] = useState(false);
  const [enCours, setEnCours] = useState(false);

  async function soumettre(e: React.FormEvent) {
    e.preventDefault();
    setErreur('');

    if (motDePasse !== confirmation) {
      setErreur('Les deux mots de passe ne correspondent pas');
      return;
    }

    setEnCours(true);
    try {
      const res = await fetch(`${API_URL}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword: motDePasse }),
      });
      const json = await res.json();
      if (!res.ok) {
        // Les erreurs de politique de mot de passe arrivent en 422 avec le détail par
        // champ : on les affiche telles quelles plutôt qu'un « données invalides ».
        setErreur(json.errors?.[0]?.message || json.message || 'Réinitialisation impossible');
        return;
      }
      setFait(true);
      setTimeout(() => router.replace('/login'), 2500);
    } catch {
      setErreur('Serveur injoignable');
    } finally {
      setEnCours(false);
    }
  }

  if (!token) {
    return (
      <p className="text-sm text-center" style={{ color: 'var(--color-danger)' }}>
        Ce lien est incomplet. Demandez un nouveau lien à un administrateur de la régie.
      </p>
    );
  }

  if (fait) {
    return (
      <div className="text-center space-y-3">
        <CheckCircle2 className="w-10 h-10 mx-auto" style={{ color: 'var(--color-success)' }} />
        <p className="text-sm font-semibold" style={{ color: 'var(--color-ink)' }}>
          Mot de passe enregistré.
        </p>
        <p className="text-xs" style={{ color: 'var(--color-ink-3)' }}>
          Redirection vers la connexion...
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={soumettre} className="space-y-4">
      <div>
        <label className="text-xs font-bold tracking-widest block mb-1.5" style={{ color: 'var(--color-ink-3)' }} htmlFor="mdp">
          NOUVEAU MOT DE PASSE
        </label>
        <input id="mdp" type="password" className="input" required autoComplete="new-password"
          value={motDePasse} onChange={(e) => setMotDePasse(e.target.value)} />
        <p className="text-xs mt-1.5" style={{ color: 'var(--color-ink-3)' }}>
          10 caractères minimum, avec au moins une majuscule, une minuscule et un chiffre.
        </p>
      </div>
      <div>
        <label className="text-xs font-bold tracking-widest block mb-1.5" style={{ color: 'var(--color-ink-3)' }} htmlFor="mdp2">
          CONFIRMATION
        </label>
        <input id="mdp2" type="password" className="input" required autoComplete="new-password"
          value={confirmation} onChange={(e) => setConfirmation(e.target.value)} />
      </div>

      {erreur && (
        <p className="text-sm p-3 rounded-xl" role="alert"
          style={{ background: 'var(--color-danger-soft)', color: 'var(--color-danger)' }}>
          {erreur}
        </p>
      )}

      <button type="submit" className="btn btn-primary w-full" disabled={enCours}>
        <KeyRound className="w-4 h-4" /> {enCours ? 'Enregistrement...' : 'Définir mon mot de passe'}
      </button>

      <p className="text-xs text-center" style={{ color: 'var(--color-ink-3)' }}>
        <Link href="/login" style={{ color: 'var(--color-primary)' }}>Retour à la connexion</Link>
      </p>
    </form>
  );
}

export default function ReinitialiserPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'var(--gradient-brand-deep)' }}>
      <div className="w-full max-w-sm card p-7">
        <div className="flex items-center gap-2.5 mb-6">
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: 'var(--gradient-brand)' }}>
            <Tv className="w-5 h-5" style={{ color: '#001018' }} />
          </div>
          <div>
            <p className="font-extrabold text-lg leading-none tracking-tight" style={{ color: 'var(--color-ink)' }}>ANTENN</p>
            <p className="text-[11px] font-medium mt-0.5" style={{ color: 'var(--color-ink-3)' }}>Réinitialisation du mot de passe</p>
          </div>
        </div>

        {/* useSearchParams impose une frontière Suspense pour le rendu statique. */}
        <Suspense fallback={<p className="text-sm" style={{ color: 'var(--color-ink-3)' }}>Chargement...</p>}>
          <FormulaireReinitialisation />
        </Suspense>
      </div>
    </div>
  );
}
