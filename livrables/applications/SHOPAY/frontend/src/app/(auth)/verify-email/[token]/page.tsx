'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Store, CheckCircle2, XCircle } from 'lucide-react';
import api from '@/lib/api';

export default function VerifyEmailPage() {
  const { token } = useParams<{ token: string }>();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');

  useEffect(() => {
    api
      .post('/auth/verify-email', { token })
      .then(() => setStatus('success'))
      .catch(() => setStatus('error'));
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ background: 'var(--color-bg)' }}>
      <div className="w-full text-center" style={{ maxWidth: 400 }}>
        <Link href="/" className="flex items-center gap-2.5 mb-8 justify-center">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'var(--gradient-brand)' }}>
            <Store className="w-4 h-4 text-white" />
          </div>
          <span className="font-extrabold text-lg tracking-tight">SHOPAY</span>
        </Link>

        <div className="card p-8">
          {status === 'loading' && <p className="text-sm" style={{ color: 'var(--color-ink-2)' }}>Vérification en cours...</p>}
          {status === 'success' && (
            <>
              <CheckCircle2 className="w-10 h-10 mx-auto mb-3" style={{ color: 'var(--color-success)' }} />
              <h2 className="text-xl font-extrabold mb-2">Email vérifié</h2>
              <p className="text-sm mb-6" style={{ color: 'var(--color-ink-2)' }}>Votre adresse email a bien été vérifiée.</p>
              <Link href="/login" className="btn btn-primary w-full">Se connecter</Link>
            </>
          )}
          {status === 'error' && (
            <>
              <XCircle className="w-10 h-10 mx-auto mb-3" style={{ color: 'var(--color-danger)' }} />
              <h2 className="text-xl font-extrabold mb-2">Lien invalide ou expiré</h2>
              <p className="text-sm mb-6" style={{ color: 'var(--color-ink-2)' }}>Ce lien de vérification n&apos;est plus valide.</p>
              <Link href="/login" className="btn btn-secondary w-full">Retour à la connexion</Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
