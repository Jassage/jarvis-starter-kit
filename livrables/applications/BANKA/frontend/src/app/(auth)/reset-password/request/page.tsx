'use client';
import { useState } from 'react';
import api from '@/lib/api';

export default function RequestResetPage() {
  const [email, setEmail]     = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent]       = useState(false);
  const [error, setError]     = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.post('/auth/reset-password/request', { email });
      setSent(true);
    } catch {
      setError('Une erreur est survenue. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f1923] px-4">
      <div className="w-full max-w-md">
        <div className="bg-[#1a2535] rounded-2xl p-8 shadow-xl border border-white/10">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-white">Mot de passe oublié</h1>
            <p className="text-white/50 text-sm mt-2">
              Entrez votre adresse email et nous vous enverrons un lien de réinitialisation.
            </p>
          </div>

          {sent ? (
            <div className="text-center py-6">
              <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-white font-semibold">Email envoyé</p>
              <p className="text-white/50 text-sm mt-2">
                Si cet email est enregistré, un lien valide 1 heure vous a été envoyé.
              </p>
              <a
                href="/login"
                className="inline-block mt-6 text-sm font-semibold"
                style={{ color: '#c8941c' }}
              >
                Retour à la connexion
              </a>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 text-red-400 text-sm">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-white/70 text-sm mb-2">Adresse email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoFocus
                  placeholder="votre.email@banka.ht"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-[#c8941c]/60 transition-colors"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl font-semibold text-white transition-opacity disabled:opacity-60"
                style={{ background: '#c8941c' }}
              >
                {loading ? 'Envoi en cours…' : 'Envoyer le lien'}
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
