'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { Store } from 'lucide-react';
import api from '@/lib/api';

export default function ResetPasswordPage() {
  const { token } = useParams<{ token: string }>();
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password !== confirm) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }
    setLoading(true);
    try {
      await api.post('/auth/reset-password', { token, password });
      setDone(true);
      setTimeout(() => router.push('/login'), 2500);
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(message || 'Lien invalide ou expiré');
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

        {done ? (
          <div className="card p-6 text-center">
            <h2 className="text-xl font-extrabold mb-2">Mot de passe mis à jour</h2>
            <p className="text-sm" style={{ color: 'var(--color-ink-2)' }}>Redirection vers la connexion...</p>
          </div>
        ) : (
          <>
            <h2 className="text-2xl font-extrabold tracking-tight mb-1.5 text-center">Nouveau mot de passe</h2>
            <p className="text-sm mb-8 text-center" style={{ color: 'var(--color-ink-3)' }}>Choisissez un nouveau mot de passe pour votre compte.</p>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Nouveau mot de passe"
                className="input"
              />
              <input
                type="password"
                required
                minLength={8}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="Confirmer le mot de passe"
                className="input"
              />
              {error && (
                <div className="text-sm p-3 rounded-xl font-medium" style={{ background: 'var(--color-danger-soft)', color: 'var(--color-danger)' }}>
                  {error}
                </div>
              )}
              <button type="submit" disabled={loading} className="btn btn-primary w-full py-3.5">
                {loading ? 'Enregistrement...' : 'Réinitialiser le mot de passe'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
