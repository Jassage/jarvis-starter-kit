'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';

const GREEN = '#16a34a';
const GREEN_BG = 'rgba(22,163,74,0.10)';
const GREEN_BD = 'rgba(22,163,74,0.30)';

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

  const inputStyle = {
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.12)',
    color: 'white',
  };
  const inputFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.style.borderColor = GREEN_BD;
    e.target.style.background = GREEN_BG;
  };
  const inputBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.style.borderColor = 'rgba(255,255,255,0.12)';
    e.target.style.background = 'rgba(255,255,255,0.06)';
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 relative"
      style={{ background: 'linear-gradient(135deg, #06170d 0%, #0a2417 45%, #0d3320 100%)' }}
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.04) 1px, transparent 0)', backgroundSize: '40px 40px' }}
        aria-hidden
      />

      <div
        className="relative z-10 w-full flex flex-col justify-center p-10 overflow-hidden"
        style={{
          maxWidth: 440,
          borderRadius: 20,
          background: 'rgba(10,24,16,0.88)',
          border: '1px solid rgba(255,255,255,0.09)',
          backdropFilter: 'blur(24px)',
          boxShadow: '0 32px 80px rgba(0,0,0,0.6)',
        }}
      >
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: GREEN_BG, border: `1px solid ${GREEN_BD}` }}>
            <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5">
              <path d="M3 9l9-7 9 7M5 9v11h14V9M9 20v-6h6v6" stroke={GREEN} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <span className="font-black text-xl text-white">GESCOM</span>
        </div>

        <p className="text-xs font-bold tracking-widest mb-2" style={{ color: GREEN }}>GESTION COMMERCIALE</p>
        <h2 className="text-3xl font-bold text-white mb-1">Connexion</h2>
        <p className="text-sm mb-8" style={{ color: 'rgba(255,255,255,0.45)' }}>
          Entrez vos identifiants pour accéder à votre espace.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold tracking-widest mb-2" style={{ color: GREEN }}>ADRESSE EMAIL</label>
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="vous@gescom.ht"
              autoComplete="email"
              className="w-full px-4 py-3 rounded-xl text-sm focus:outline-none transition-all"
              style={inputStyle}
              onFocus={inputFocus}
              onBlur={inputBlur}
            />
          </div>

          <div>
            <label className="block text-xs font-bold tracking-widest mb-2" style={{ color: GREEN }}>MOT DE PASSE</label>
            <div className="relative">
              <input
                type={showPwd ? 'text' : 'password'}
                required
                value={form.motDePasse}
                onChange={(e) => setForm({ ...form, motDePasse: e.target.value })}
                placeholder="••••••••"
                autoComplete="current-password"
                className="w-full px-4 py-3 pr-12 rounded-xl text-sm focus:outline-none transition-all"
                style={inputStyle}
                onFocus={inputFocus}
                onBlur={inputBlur}
              />
              <button
                type="button"
                onClick={() => setShowPwd(!showPwd)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs"
                style={{ color: 'rgba(255,255,255,0.4)' }}
              >
                {showPwd ? 'Masquer' : 'Afficher'}
              </button>
            </div>
          </div>

          {error && (
            <div className="flex items-start gap-2 p-3 rounded-xl text-sm" style={{ background: 'rgba(185,28,28,0.15)', border: '1px solid rgba(239,68,68,0.25)', color: '#fca5a5' }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 rounded-xl font-bold text-sm transition-all disabled:opacity-50"
            style={{ background: GREEN, color: 'white', marginTop: 8 }}
          >
            {isLoading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>

        {process.env.NODE_ENV === 'development' && (
          <div className="mt-6 p-4 rounded-xl" style={{ background: GREEN_BG, border: `1px solid ${GREEN_BD}` }}>
            <p className="text-[10px] font-bold tracking-widest mb-2" style={{ color: GREEN }}>COMPTE DE DÉMONSTRATION (DEV)</p>
            <button
              type="button"
              onClick={() => setForm({ email: 'admin@gescom.ht', motDePasse: 'Admin@123' })}
              className="w-full flex items-center justify-between text-xs rounded-lg px-2.5 py-1.5"
              style={{ color: 'rgba(255,255,255,0.55)' }}
            >
              <span>Super Admin</span>
              <span className="font-mono" style={{ color: 'rgba(255,255,255,0.40)' }}>admin@gescom.ht</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
