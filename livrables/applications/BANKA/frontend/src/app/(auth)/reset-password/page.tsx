'use client';
import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import api from '@/lib/api';

function ResetPasswordForm() {
  const router         = useRouter();
  const searchParams   = useSearchParams();
  const token          = searchParams.get('token') || '';

  const [form, setForm]     = useState({ nouveauMotDePasse: '', confirmer: '' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError]     = useState('');
  const [showPwd, setShowPwd] = useState(false);

  useEffect(() => {
    if (!token) setError('Lien invalide ou expiré. Faites une nouvelle demande.');
  }, [token]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (form.nouveauMotDePasse !== form.confirmer) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }

    setLoading(true);
    try {
      await api.post('/auth/reset-password/confirm', {
        token,
        nouveauMotDePasse: form.nouveauMotDePasse,
      });
      setSuccess(true);
      setTimeout(() => router.push('/login'), 3000);
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Lien invalide ou expiré. Faites une nouvelle demande.');
    } finally {
      setLoading(false);
    }
  }

  const RULES = [
    { label: '12 caractères minimum', ok: form.nouveauMotDePasse.length >= 12 },
    { label: 'Une majuscule',         ok: /[A-Z]/.test(form.nouveauMotDePasse) },
    { label: 'Une minuscule',         ok: /[a-z]/.test(form.nouveauMotDePasse) },
    { label: 'Un chiffre',            ok: /[0-9]/.test(form.nouveauMotDePasse) },
    { label: 'Un caractère spécial',  ok: /[^A-Za-z0-9]/.test(form.nouveauMotDePasse) },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f1923] px-4">
      <div className="w-full max-w-md">
        <div className="bg-[#1a2535] rounded-2xl p-8 shadow-xl border border-white/10">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-white">Nouveau mot de passe</h1>
            <p className="text-white/50 text-sm mt-2">
              Choisissez un mot de passe fort pour sécuriser votre compte.
            </p>
          </div>

          {success ? (
            <div className="text-center py-6">
              <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-white font-semibold">Mot de passe réinitialisé</p>
              <p className="text-white/50 text-sm mt-2">
                Toutes vos sessions ont été déconnectées. Redirection vers la connexion…
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 text-red-400 text-sm">
                  {error}
                  {error.includes('nouvelle demande') && (
                    <a href="/reset-password/request" className="block mt-1 underline font-semibold">
                      Faire une nouvelle demande
                    </a>
                  )}
                </div>
              )}

              <div>
                <label className="block text-white/70 text-sm mb-2">Nouveau mot de passe</label>
                <div className="relative">
                  <input
                    type={showPwd ? 'text' : 'password'}
                    value={form.nouveauMotDePasse}
                    onChange={(e) => setForm((f) => ({ ...f, nouveauMotDePasse: e.target.value }))}
                    required
                    autoFocus
                    placeholder="••••••••••••"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-[#c8941c]/60 transition-colors pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPwd((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 text-xs"
                  >
                    {showPwd ? 'Masquer' : 'Afficher'}
                  </button>
                </div>
                {form.nouveauMotDePasse && (
                  <ul className="mt-2 space-y-1">
                    {RULES.map((r) => (
                      <li key={r.label} className={`text-xs flex items-center gap-1.5 ${r.ok ? 'text-green-400' : 'text-white/40'}`}>
                        <span>{r.ok ? '✓' : '○'}</span> {r.label}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div>
                <label className="block text-white/70 text-sm mb-2">Confirmer le mot de passe</label>
                <input
                  type={showPwd ? 'text' : 'password'}
                  value={form.confirmer}
                  onChange={(e) => setForm((f) => ({ ...f, confirmer: e.target.value }))}
                  required
                  placeholder="••••••••••••"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-[#c8941c]/60 transition-colors"
                />
              </div>

              <button
                type="submit"
                disabled={loading || !token || RULES.some((r) => !r.ok)}
                className="w-full py-3 rounded-xl font-semibold text-white transition-opacity disabled:opacity-60"
                style={{ background: '#c8941c' }}
              >
                {loading ? 'Enregistrement…' : 'Enregistrer le nouveau mot de passe'}
              </button>

              <div className="text-center">
                <a href="/login" className="text-white/40 text-sm hover:text-white/70 transition-colors">
                  Retour à la connexion
                </a>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordForm />
    </Suspense>
  );
}
