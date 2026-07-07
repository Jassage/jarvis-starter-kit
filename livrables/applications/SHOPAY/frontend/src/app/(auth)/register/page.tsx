'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';

export default function RegisterPage() {
  const router = useRouter();
  const { register, isLoading } = useAuthStore();
  const [form, setForm] = useState({
    boutiqueName: '',
    firstName: '',
    lastName: '',
    email: '',
    password: '',
  });
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await register(form);
      router.push('/dashboard');
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(message || "Impossible de créer le compte");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ background: 'var(--color-bg)' }}>
      <div className="w-full card p-8" style={{ maxWidth: 460 }}>
        <p className="text-xs font-bold tracking-widest mb-2" style={{ color: 'var(--color-primary-2)' }}>DÉMARRER</p>
        <h1 className="text-2xl font-extrabold tracking-tight mb-1.5">Créez votre boutique</h1>
        <p className="text-sm mb-6" style={{ color: 'var(--color-ink-3)' }}>
          Un compte marchand et une boutique en ligne, prêts en une minute.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold mb-1.5">Nom de la boutique</label>
            <input
              required
              value={form.boutiqueName}
              onChange={(e) => setForm({ ...form, boutiqueName: e.target.value })}
              placeholder="Ma Petite Boutique"
              className="input"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold mb-1.5">Prénom</label>
              <input required value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} className="input" />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1.5">Nom</label>
              <input required value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} className="input" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1.5">Adresse email</label>
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="vous@boutique.ht"
              className="input"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1.5">Mot de passe</label>
            <input
              type="password"
              required
              minLength={8}
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="8 caractères minimum"
              className="input"
            />
          </div>

          {error && (
            <div className="text-sm p-3 rounded-xl font-medium" style={{ background: 'var(--color-danger-soft)', color: 'var(--color-danger)' }}>
              {error}
            </div>
          )}

          <button type="submit" disabled={isLoading} className="btn btn-primary w-full py-3.5 mt-2">
            {isLoading ? 'Création...' : 'Créer ma boutique'}
          </button>
        </form>

        <p className="text-sm text-center mt-6" style={{ color: 'var(--color-ink-3)' }}>
          Déjà un compte ?{' '}
          <Link href="/login" className="font-semibold" style={{ color: 'var(--color-primary-2)' }}>Se connecter</Link>
        </p>
      </div>
    </div>
  );
}
