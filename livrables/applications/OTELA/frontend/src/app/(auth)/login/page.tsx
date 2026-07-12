'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Hotel, Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';

const DEMO_ACCOUNTS = [
  { role: 'Réception', email: 'reception@otela.ht' },
  { role: 'Admin établissement', email: 'administrateur@otela.ht' },
  { role: 'Admin chaîne', email: 'chaine@otela.ht' },
];

const GOLD = '#c8941c';
const GOLD_BG = 'rgba(200,148,28,0.12)';
const GOLD_BD = 'rgba(200,148,28,0.32)';

function redirectionParRole(role: string) {
  if (role === 'ADMINISTRATEUR_CHAINE') return '/chaine';
  if (role === 'MENAGE') return '/menage';
  if (role === 'SERVEUR') return '/pos';
  return '/reception';
}

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading, employe } = useAuthStore();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [showPwd, setShowPwd] = useState(false);

  useEffect(() => {
    if (employe) router.replace(redirectionParRole(employe.role));
  }, [employe, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await login(form.email, form.password);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Identifiants invalides');
    }
  };

  const inputStyle = {
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.12)',
    color: 'white',
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 relative"
      style={{ background: 'linear-gradient(135deg, #050b1a 0%, #0b1733 45%, #14213d 100%)' }}
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.04) 1px, transparent 0)',
          backgroundSize: '40px 40px',
        }}
        aria-hidden
      />
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden>
        <div className="absolute w-96 h-96 rounded-full" style={{ background: `radial-gradient(circle, ${GOLD_BG} 0%, transparent 70%)`, top: '10%', left: '15%' }} />
        <div className="absolute w-80 h-80 rounded-full" style={{ background: 'radial-gradient(circle, rgba(37,99,235,0.10) 0%, transparent 70%)', bottom: '15%', right: '20%' }} />
      </div>

      <div
        className="relative z-10 w-full flex overflow-hidden"
        style={{ maxWidth: 860, borderRadius: 20, background: 'rgba(10,18,40,0.88)', border: '1px solid rgba(255,255,255,0.09)', backdropFilter: 'blur(24px)', boxShadow: '0 32px 80px rgba(0,0,0,0.6)' }}
      >
        <div
          className="hidden lg:flex flex-col justify-between p-10 relative overflow-hidden"
          style={{ width: 380, minWidth: 380, background: 'rgba(255,255,255,0.03)', borderRight: '1px solid rgba(255,255,255,0.08)' }}
        >
          <div className="relative z-10 flex flex-col items-center text-center">
            <div className="w-20 h-20 rounded-full flex items-center justify-center mb-5" style={{ background: GOLD_BG, border: `2px solid ${GOLD_BD}` }}>
              <Hotel className="w-10 h-10" style={{ color: GOLD }} />
            </div>
            <div className="flex items-center gap-1.5 px-4 py-1.5 rounded-full mb-6 text-xs font-bold tracking-widest" style={{ background: GOLD_BG, border: `1px solid ${GOLD_BD}`, color: GOLD }}>
              <span>●</span>
              <span>PMS HÔTELIER</span>
            </div>
            <h1 className="text-5xl font-black tracking-tight text-white mb-1">OTELA</h1>
            <p className="text-xl font-semibold mb-4" style={{ color: '#93a1c0', fontStyle: 'italic' }}>Chaîne hôtelière</p>
            <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.50)' }}>
              Réservations, chambres et tarifs.<br />Haitech Solutions
            </p>
          </div>
          <p className="text-center text-xs" style={{ color: 'rgba(255,255,255,0.25)' }}>OTELA © 2026 — Haitech Solutions</p>
        </div>

        <div className="flex-1 flex flex-col justify-center p-10" style={{ background: 'rgba(255,255,255,0.02)' }}>
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: GOLD_BG, border: `1px solid ${GOLD_BD}` }}>
              <Hotel className="w-5 h-5" style={{ color: GOLD }} />
            </div>
            <span className="font-black text-xl text-white">OTELA</span>
          </div>

          <p className="text-xs font-bold tracking-widest mb-2" style={{ color: GOLD }}>ESPACE PERSONNEL</p>
          <h2 className="text-3xl font-bold text-white mb-1">Connexion</h2>
          <p className="text-sm mb-8" style={{ color: 'rgba(255,255,255,0.45)' }}>Réception, gestion d'établissement ou administration de la chaîne.</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold tracking-widest mb-2" style={{ color: GOLD }}>ADRESSE EMAIL</label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'rgba(255,255,255,0.35)' }} />
                <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="vous@otela.ht" autoComplete="email" className="w-full pl-10 pr-4 py-3 rounded-xl text-sm focus:outline-none transition-all" style={inputStyle} />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold tracking-widest mb-2" style={{ color: GOLD }}>MOT DE PASSE</label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'rgba(255,255,255,0.35)' }} />
                <input type={showPwd ? 'text' : 'password'} required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="••••••••" autoComplete="current-password" className="w-full pl-10 pr-12 py-3 rounded-xl text-sm focus:outline-none transition-all" style={inputStyle} />
                <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-3.5 top-1/2 -translate-y-1/2" style={{ color: 'rgba(255,255,255,0.35)' }}>
                  {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-start gap-2 p-3 rounded-xl text-sm" style={{ background: 'rgba(185,28,28,0.15)', border: '1px solid rgba(239,68,68,0.25)', color: '#fca5a5' }}>
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                {error}
              </div>
            )}

            <button type="submit" disabled={isLoading} className="w-full py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-50" style={{ background: GOLD, color: '#1a1002', marginTop: 8 }}>
              {isLoading ? (
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.25" />
                  <path d="M22 12a10 10 0 01-10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                </svg>
              ) : 'Se connecter'}
            </button>
          </form>

          {process.env.NODE_ENV === 'development' && (
            <div className="mt-5 p-4 rounded-xl" style={{ background: GOLD_BG, border: `1px solid ${GOLD_BD}` }}>
              <p className="text-[10px] font-bold tracking-widest mb-2.5" style={{ color: GOLD }}>COMPTES DE DÉMONSTRATION (DEV)</p>
              <div className="space-y-1.5">
                {DEMO_ACCOUNTS.map((a) => (
                  <button key={a.email} type="button" onClick={() => setForm({ email: a.email, password: 'Otela@123' })} className="w-full flex items-center justify-between text-xs rounded-lg px-2.5 py-1.5 transition-colors" style={{ color: 'rgba(255,255,255,0.55)' }}>
                    <span>{a.role}</span>
                    <span className="font-mono" style={{ color: 'rgba(255,255,255,0.40)' }}>{a.email}</span>
                  </button>
                ))}
                <div className="flex justify-between text-xs pt-1.5 mt-1" style={{ borderTop: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.35)' }}>
                  <span>Mot de passe commun</span>
                  <span className="font-mono font-semibold" style={{ color: 'rgba(255,255,255,0.5)' }}>Otela@123</span>
                </div>
              </div>
            </div>
          )}

          <p className="text-center text-xs mt-5" style={{ color: 'rgba(255,255,255,0.20)' }}>OTELA · Haitech Solutions · 2026</p>
        </div>
      </div>
    </div>
  );
}
