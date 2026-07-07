'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Store } from 'lucide-react';
import api from '@/lib/api';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      setSent(true);
    } catch {
      setError("Une erreur est survenue, réessayez.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ background: 'var(--color-bg)' }}>
      <div className="w-full" style={{ maxWidth: 400 }}>
        <Link href="/" className="flex items-center gap-2.5 mb-8 justify-center">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'var(--gradient-brand)' }}>
            <Store className="w-4 h-4 text-white" />
          </div>
          <span className="font-extrabold text-lg tracking-tight">SHOPAY</span>
        </Link>

        {sent ? (
          <div className="card p-6 text-center">
            <h2 className="text-xl font-extrabold mb-2">Vérifiez votre email</h2>
            <p className="text-sm" style={{ color: 'var(--color-ink-2)' }}>
              Si un compte existe avec l&apos;adresse <strong>{email}</strong>, un lien de réinitialisation vient d&apos;être envoyé (valable 1 heure).
            </p>
            <Link href="/login" className="btn btn-secondary w-full mt-6">Retour à la connexion</Link>
          </div>
        ) : (
          <>
            <h2 className="text-2xl font-extrabold tracking-tight mb-1.5 text-center">Mot de passe oublié</h2>
            <p className="text-sm mb-8 text-center" style={{ color: 'var(--color-ink-3)' }}>
              Entrez votre email, nous vous enverrons un lien de réinitialisation.
            </p>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="vous@boutique.ht"
                className="input"
              />
              {error && (
                <div className="text-sm p-3 rounded-xl font-medium" style={{ background: 'var(--color-danger-soft)', color: 'var(--color-danger)' }}>
                  {error}
                </div>
              )}
              <button type="submit" disabled={loading} className="btn btn-primary w-full py-3.5">
                {loading ? 'Envoi...' : 'Envoyer le lien'}
              </button>
            </form>
            <p className="text-sm text-center mt-6" style={{ color: 'var(--color-ink-3)' }}>
              <Link href="/login" className="font-semibold" style={{ color: 'var(--color-primary-2)' }}>Retour à la connexion</Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
