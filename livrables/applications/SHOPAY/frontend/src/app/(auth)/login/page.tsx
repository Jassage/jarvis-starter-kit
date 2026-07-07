'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Store, Package, CreditCard } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';

const FEATURES = [
  { icon: Store, label: 'Créez votre boutique en ligne en quelques minutes' },
  { icon: Package, label: 'Catalogue produits, variantes et stock' },
  { icon: CreditCard, label: 'Paiements Stripe, MonCash et preuve manuelle' },
];

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading } = useAuthStore();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [showPwd, setShowPwd] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await login(form.email, form.password);
      const role = useAuthStore.getState().user?.role;
      router.push(role === 'PLATFORM_SUPER_ADMIN' ? '/admin/boutiques' : '/dashboard');
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(message || 'Identifiants invalides');
    }
  };

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--color-bg)' }}>
      <div
        className="hidden lg:flex lg:w-[44%] relative overflow-hidden flex-col justify-between p-12 text-white"
        style={{ background: 'var(--gradient-brand-deep)' }}
      >
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.18)' }}>
            <Store className="w-5 h-5" />
          </div>
          <span className="font-extrabold text-xl tracking-tight">SHOPAY</span>
        </div>

        <div className="relative z-10">
          <h2 className="text-3xl font-extrabold leading-tight mb-4">Vendez en ligne, sans complications.</h2>
          <div className="space-y-4">
            {FEATURES.map((f) => (
              <div key={f.label} className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'rgba(255,255,255,0.1)' }}>
                  <f.icon className="w-4 h-4" />
                </div>
                <span className="text-sm font-medium" style={{ color: 'rgba(255,255,255,0.85)' }}>{f.label}</span>
              </div>
            ))}
          </div>
        </div>
        <p className="relative z-10 text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>© {new Date().getFullYear()} SHOPAY</p>
      </div>

      <div className="flex-1 flex items-center justify-center p-6 sm:p-10">
        <div className="w-full" style={{ maxWidth: 400 }}>
          <p className="text-xs font-bold tracking-widest mb-2" style={{ color: 'var(--color-primary-2)' }}>BON RETOUR</p>
          <h2 className="text-3xl font-extrabold tracking-tight mb-1.5">Connexion</h2>
          <p className="text-sm mb-8" style={{ color: 'var(--color-ink-3)' }}>Accédez à votre espace marchand ou administrateur.</p>

          <form onSubmit={handleSubmit} className="space-y-4">
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
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold">Mot de passe</label>
                <Link href="/forgot-password" className="text-xs font-semibold" style={{ color: 'var(--color-primary-2)' }}>Mot de passe oublié ?</Link>
              </div>
              <div className="relative">
                <input
                  type={showPwd ? 'text' : 'password'}
                  required
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="••••••••"
                  className="input pr-11"
                />
                <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-ink-3)' }}>
                  {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="text-sm p-3 rounded-xl font-medium" style={{ background: 'var(--color-danger-soft)', color: 'var(--color-danger)' }}>
                {error}
              </div>
            )}

            <button type="submit" disabled={isLoading} className="btn btn-primary w-full py-3.5 mt-2">
              {isLoading ? 'Connexion...' : 'Se connecter'}
            </button>
          </form>

          <p className="text-sm text-center mt-6" style={{ color: 'var(--color-ink-3)' }}>
            Pas encore de boutique ?{' '}
            <Link href="/register" className="font-semibold" style={{ color: 'var(--color-primary-2)' }}>Créer ma boutique</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
