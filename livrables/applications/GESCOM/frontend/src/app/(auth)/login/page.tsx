'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Warehouse, ShoppingCart, BarChart3 } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';

const FEATURES = [
  { icon: Warehouse, label: 'Stock multi-emplacement en temps réel' },
  { icon: ShoppingCart, label: 'Ventes, achats et transferts unifiés' },
  { icon: BarChart3, label: 'Tableau de bord et comptabilité intégrés' },
];

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading } = useAuthStore();
  const [form, setForm] = useState({ email: '', motDePasse: '' });
  const [error, setError] = useState('');
  const [showPwd, setShowPwd] = useState(false);

  const handleSubmit = async (e: { preventDefault(): void }) => {
    e.preventDefault();
    setError('');
    try {
      await login(form.email, form.motDePasse);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Identifiants invalides');
    }
  };

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--color-bg)' }}>
      {/* Panneau de marque */}
      <div
        className="hidden lg:flex lg:w-[44%] relative overflow-hidden flex-col justify-between p-12 text-white"
        style={{ background: 'var(--gradient-brand-deep)' }}
      >
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.07]"
          style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '32px 32px' }}
          aria-hidden
        />
        <svg className="absolute -bottom-24 -left-16 opacity-[0.10] pointer-events-none" width="360" height="360" viewBox="0 0 360 360" fill="none" aria-hidden>
          <circle cx="180" cy="180" r="150" stroke="white" strokeWidth="1.5" />
          <circle cx="180" cy="180" r="95" stroke="white" strokeWidth="1.5" />
        </svg>

        <div className="relative z-10 flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.18)' }}>
            <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5">
              <path d="M3 9l9-7 9 7M5 9v11h14V9M9 20v-6h6v6" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <span className="font-extrabold text-xl tracking-tight">GESCOM</span>
        </div>

        <div className="relative z-10">
          <h2 className="text-3xl font-extrabold leading-tight mb-4">
            La gestion commerciale, simplifiée.
          </h2>
          <p className="text-sm mb-8" style={{ color: 'rgba(255,255,255,0.65)' }}>
            Stock, ventes, achats et comptabilité réunis dans un seul espace de travail.
          </p>
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

        <p className="relative z-10 text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
          © {new Date().getFullYear()} GESCOM · Gestion commerciale
        </p>
      </div>

      {/* Panneau formulaire */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10">
        <div className="w-full" style={{ maxWidth: 400 }}>
          <div className="lg:hidden flex items-center gap-2.5 mb-8">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: 'var(--gradient-brand)' }}>
              <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 text-white">
                <path d="M3 9l9-7 9 7M5 9v11h14V9M9 20v-6h6v6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <span className="font-extrabold text-lg tracking-tight" style={{ color: 'var(--color-ink)' }}>GESCOM</span>
          </div>

          <p className="text-xs font-bold tracking-widest mb-2" style={{ color: 'var(--color-primary-2)' }}>BON RETOUR</p>
          <h2 className="text-3xl font-extrabold tracking-tight mb-1.5" style={{ color: 'var(--color-ink)' }}>Connexion</h2>
          <p className="text-sm mb-8" style={{ color: 'var(--color-ink-3)' }}>
            Entrez vos identifiants pour accéder à votre espace.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--color-ink-2)' }}>Adresse email</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="vous@gescom.ht"
                autoComplete="email"
                className="input"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--color-ink-2)' }}>Mot de passe</label>
              <div className="relative">
                <input
                  type={showPwd ? 'text' : 'password'}
                  required
                  value={form.motDePasse}
                  onChange={(e) => setForm({ ...form, motDePasse: e.target.value })}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="input pr-11"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2"
                  style={{ color: 'var(--color-ink-3)' }}
                  aria-label={showPwd ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                >
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

          {process.env.NODE_ENV === 'development' && (
            <div className="mt-6 p-4 rounded-xl" style={{ background: 'var(--color-primary-soft)' }}>
              <p className="text-[10px] font-bold tracking-widest mb-2" style={{ color: 'var(--color-primary-2)' }}>COMPTE DE DÉMONSTRATION (DEV)</p>
              <button
                type="button"
                onClick={() => setForm({ email: 'admin@gescom.ht', motDePasse: 'Admin@123' })}
                className="w-full flex items-center justify-between text-xs rounded-lg px-2.5 py-1.5"
                style={{ color: 'var(--color-ink-2)' }}
              >
                <span className="font-semibold">Super Admin</span>
                <span className="font-mono" style={{ color: 'var(--color-ink-3)' }}>admin@gescom.ht</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
