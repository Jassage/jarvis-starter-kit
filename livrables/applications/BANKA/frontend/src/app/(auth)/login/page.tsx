'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading } = useAuthStore();
  const [form, setForm] = useState({ email: '', motDePasse: '' });
  const [error, setError] = useState('');
  const [showPwd, setShowPwd] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
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
    <div className="min-h-screen flex">
      {/* Visual side */}
      <div className="hidden lg:flex flex-1 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #0b1733 0%, #1e3a8a 50%, #2563eb 100%)' }}>
        <div className="absolute inset-0 opacity-20">
          <svg className="absolute top-10 left-10" width="200" height="200" viewBox="0 0 200 200" fill="none">
            <circle cx="100" cy="100" r="80" stroke="white" strokeWidth="1" />
            <circle cx="100" cy="100" r="50" stroke="white" strokeWidth="1" />
            <circle cx="100" cy="100" r="20" stroke="white" strokeWidth="1" />
          </svg>
          <svg className="absolute bottom-10 right-10" width="300" height="300" viewBox="0 0 300 300" fill="none">
            <path d="M0 150 Q75 50 150 150 T300 150" stroke="white" strokeWidth="1" fill="none" />
            <path d="M0 180 Q75 80 150 180 T300 180" stroke="white" strokeWidth="1" fill="none" opacity="0.5" />
          </svg>
        </div>

        <div className="relative z-10 flex flex-col justify-between p-12 text-white">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-white/15 backdrop-blur rounded-xl flex items-center justify-center border border-white/20">
              <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6">
                <path d="M3 21h18M5 21V8l7-4 7 4v13M9 21v-8h6v8M9 12h6" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div>
              <p className="font-bold text-xl tracking-tight">BANKA</p>
              <p className="text-xs text-blue-200 -mt-0.5">Système de gestion bancaire</p>
            </div>
          </div>

          <div className="max-w-md">
            <h1 className="text-4xl font-bold leading-tight mb-4">
              La banque moderne pour Haïti.
            </h1>
            <p className="text-blue-100 text-lg leading-relaxed">
              Gérez vos clients, comptes, transactions et crédits dans une interface pensée pour la précision financière.
            </p>

            <div className="mt-10 space-y-4">
              {[
                { t: 'Sécurisé', d: 'Audit complet et validation multi-niveaux' },
                { t: 'Multi-devises', d: 'HTG et USD natifs, conversion automatique' },
                { t: 'Temps réel', d: 'Soldes et stats mis à jour instantanément' },
              ].map((f, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4">
                      <path d="M5 13l4 4L19 7" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <div>
                    <p className="font-semibold">{f.t}</p>
                    <p className="text-sm text-blue-200">{f.d}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <p className="text-xs text-blue-300">© 2026 BANKA. Tous droits réservés.</p>
        </div>
      </div>

      {/* Form side */}
      <div className="flex-1 flex items-center justify-center p-6 bg-white">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #1e3a8a, #2563eb)' }}>
              <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6">
                <path d="M3 21h18M5 21V8l7-4 7 4v13M9 21v-8h6v8M9 12h6" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div>
              <p className="font-bold text-xl tracking-tight" style={{ color: '#0b1733' }}>BANKA</p>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold tracking-tight" style={{ color: '#0b1733' }}>Connexion à votre espace</h2>
            <p className="text-sm mt-1.5" style={{ color: '#4a5578' }}>Bienvenue. Veuillez entrer vos identifiants pour continuer.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Adresse email professionnelle</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="input"
                placeholder="vous@banka.ht"
                autoComplete="email"
              />
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label className="label">Mot de passe</label>
                <button type="button" onClick={() => setShowPwd(!showPwd)} className="text-xs font-medium" style={{ color: '#2563eb' }}>
                  {showPwd ? 'Masquer' : 'Afficher'}
                </button>
              </div>
              <input
                type={showPwd ? 'text' : 'password'}
                required
                value={form.motDePasse}
                onChange={(e) => setForm({ ...form, motDePasse: e.target.value })}
                className="input"
                placeholder="••••••••"
                autoComplete="current-password"
              />
            </div>

            {error && (
              <div className="flex items-start gap-2 p-3 rounded-xl animate-slide-up" style={{ background: '#fef2f2', border: '1px solid #fecaca' }}>
                <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 flex-shrink-0 mt-0.5">
                  <circle cx="12" cy="12" r="9" stroke="#b91c1c" strokeWidth="2"/>
                  <path d="M12 8v4M12 16h.01" stroke="#b91c1c" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                <p className="text-sm" style={{ color: '#b91c1c' }}>{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full py-3 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.25"/>
                    <path d="M22 12a10 10 0 01-10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
                  </svg>
                  <span>Connexion en cours...</span>
                </>
              ) : (
                <>
                  <span>Se connecter</span>
                  <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4">
                    <path d="M5 12h14M13 6l6 6-6 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </>
              )}
            </button>
          </form>

          <div className="mt-8 p-4 rounded-xl" style={{ background: '#f7f8fc', border: '1px solid #e7eaf3' }}>
            <p className="text-xs font-semibold mb-2" style={{ color: '#4a5578' }}>COMPTES DE DÉMONSTRATION</p>
            <div className="space-y-1.5 text-xs" style={{ color: '#4a5578' }}>
              <div className="flex justify-between"><span>Administrateur</span><span className="font-mono">admin@banka.ht</span></div>
              <div className="flex justify-between"><span>Directeur</span><span className="font-mono">directeur@banka.ht</span></div>
              <div className="flex justify-between"><span>Caissier</span><span className="font-mono">caissier@banka.ht</span></div>
              <div className="flex justify-between pt-1.5 mt-1.5 border-t" style={{ borderColor: '#e7eaf3' }}>
                <span>Mot de passe</span><span className="font-mono font-semibold">Admin@123</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
