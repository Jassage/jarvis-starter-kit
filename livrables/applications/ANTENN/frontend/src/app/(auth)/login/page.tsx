'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Tv, Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';

const TIPS = [
  { categorie: 'RÉGIE', texte: 'Une modification de grille reste en brouillon tant qu\'elle n\'est pas marquée synchronisée : elle n\'affecte jamais ce qui est réellement à l\'antenne.' },
  { categorie: 'DIRECT', texte: 'Le statut d\'un match ne passe en direct que sur action manuelle — vérifiez l\'ingest RTMP avant de démarrer.' },
  { categorie: 'HISTORIQUE', texte: 'Un créneau déjà diffusé ne peut plus être modifié ni supprimé : c\'est un historique figé.' },
  { categorie: 'SPONSORS', texte: 'Surveillez les alertes de contrat sur la page Sponsors avant qu\'un package n\'expire.' },
];

const DEMO_ACCOUNTS = [
  { role: 'Administrateur', email: 'admin@antenn.ht' },
  { role: 'Opérateur régie', email: 'operateur@antenn.ht' },
];

const CYAN = '#22d3ee';
const CYAN_BG = 'rgba(34,211,238,0.10)';
const CYAN_BD = 'rgba(34,211,238,0.30)';
const GOLD = '#c8941c';

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading, utilisateur } = useAuthStore();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [tipIndex, setTipIndex] = useState(0);

  useEffect(() => {
    if (utilisateur) router.replace('/grille');
  }, [utilisateur, router]);

  useEffect(() => {
    const t = setInterval(() => setTipIndex((i) => (i + 1) % TIPS.length), 5000);
    return () => clearInterval(t);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await login(form.email, form.password);
      router.push('/grille');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Identifiants invalides');
    }
  };

  const tip = TIPS[tipIndex];
  const inputStyle = {
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.12)',
    color: 'white',
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 relative"
      style={{ background: 'linear-gradient(135deg, #050b1a 0%, #0b1733 45%, #0e2a45 100%)' }}
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
        <div className="absolute w-96 h-96 rounded-full" style={{ background: `radial-gradient(circle, ${CYAN_BG} 0%, transparent 70%)`, top: '10%', left: '15%' }} />
        <div className="absolute w-80 h-80 rounded-full" style={{ background: 'radial-gradient(circle, rgba(200,148,28,0.10) 0%, transparent 70%)', bottom: '15%', right: '20%' }} />
      </div>

      <div
        className="relative z-10 w-full flex overflow-hidden"
        style={{
          maxWidth: 860,
          borderRadius: 20,
          background: 'rgba(10,18,40,0.88)',
          border: '1px solid rgba(255,255,255,0.09)',
          backdropFilter: 'blur(24px)',
          boxShadow: '0 32px 80px rgba(0,0,0,0.6)',
        }}
      >
        {/* Panneau gauche */}
        <div
          className="hidden lg:flex flex-col justify-between p-10 relative overflow-hidden"
          style={{ width: 380, minWidth: 380, background: 'rgba(255,255,255,0.03)', borderRight: '1px solid rgba(255,255,255,0.08)' }}
        >
          <div className="absolute inset-0 pointer-events-none" aria-hidden>
            <svg className="absolute -top-20 -left-20 opacity-[0.07]" width="320" height="320" viewBox="0 0 320 320" fill="none">
              <circle cx="160" cy="160" r="140" stroke="white" strokeWidth="1" />
              <circle cx="160" cy="160" r="90" stroke="white" strokeWidth="1" />
              <circle cx="160" cy="160" r="40" stroke="white" strokeWidth="1" />
            </svg>
          </div>

          <div className="relative z-10 flex flex-col items-center text-center">
            <div className="w-20 h-20 rounded-full flex items-center justify-center mb-5" style={{ background: CYAN_BG, border: `2px solid ${CYAN_BD}` }}>
              <Tv className="w-10 h-10" style={{ color: CYAN }} />
            </div>
            <div className="flex items-center gap-1.5 px-4 py-1.5 rounded-full mb-6 text-xs font-bold tracking-widest" style={{ background: CYAN_BG, border: `1px solid ${CYAN_BD}`, color: CYAN }}>
              <span>●</span>
              <span>RÉGIE DE DIFFUSION</span>
            </div>
            <h1 className="text-5xl font-black tracking-tight text-white mb-1">ANTENN</h1>
            <p className="text-xl font-semibold mb-4" style={{ color: GOLD, fontStyle: 'italic' }}>Chaîne FAST</p>
            <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.50)' }}>
              Grille, sponsors et direct sport.<br />Haitech Solutions
            </p>
          </div>

          <div className="relative z-10">
            <div className="rounded-xl p-4" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderLeft: `3px solid ${CYAN}` }}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-bold tracking-widest px-2 py-1 rounded" style={{ background: CYAN_BG, color: CYAN }}>{tip.categorie}</span>
                <div className="flex gap-1">
                  {TIPS.map((_, i) => (
                    <button key={i} onClick={() => setTipIndex(i)} className="rounded-full transition-all" style={{ width: i === tipIndex ? 16 : 6, height: 6, background: i === tipIndex ? CYAN : 'rgba(255,255,255,0.2)' }} />
                  ))}
                </div>
              </div>
              <p className="text-sm italic leading-relaxed" style={{ color: 'rgba(255,255,255,0.72)' }}>{tip.texte}</p>
            </div>
            <p className="text-center text-xs mt-4" style={{ color: 'rgba(255,255,255,0.25)' }}>ANTENN © 2026 — Haitech Solutions</p>
          </div>
        </div>

        {/* Panneau droit */}
        <div className="flex-1 flex flex-col justify-center p-10" style={{ background: 'rgba(255,255,255,0.02)' }}>
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: CYAN_BG, border: `1px solid ${CYAN_BD}` }}>
              <Tv className="w-5 h-5" style={{ color: CYAN }} />
            </div>
            <span className="font-black text-xl text-white">ANTENN</span>
          </div>

          <p className="text-xs font-bold tracking-widest mb-2" style={{ color: CYAN }}>ACCÈS RÉGIE</p>
          <h2 className="text-3xl font-bold text-white mb-1">Connexion</h2>
          <p className="text-sm mb-8" style={{ color: 'rgba(255,255,255,0.45)' }}>Entrez vos identifiants pour accéder à la régie.</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold tracking-widest mb-2" style={{ color: CYAN }}>ADRESSE EMAIL</label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'rgba(255,255,255,0.35)' }} />
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="vous@antenn.ht"
                  autoComplete="email"
                  className="w-full pl-10 pr-4 py-3 rounded-xl text-sm focus:outline-none transition-all"
                  style={inputStyle}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold tracking-widest mb-2" style={{ color: CYAN }}>MOT DE PASSE</label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'rgba(255,255,255,0.35)' }} />
                <input
                  type={showPwd ? 'text' : 'password'}
                  required
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="w-full pl-10 pr-12 py-3 rounded-xl text-sm focus:outline-none transition-all"
                  style={inputStyle}
                />
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

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              style={{ background: CYAN, color: '#001018', marginTop: 8 }}
            >
              {isLoading ? (
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.25" />
                  <path d="M22 12a10 10 0 01-10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                </svg>
              ) : 'Se connecter'}
            </button>
          </form>

          {process.env.NODE_ENV === 'development' && (
            <div className="mt-5 p-4 rounded-xl" style={{ background: 'rgba(200,148,28,0.10)', border: '1px solid rgba(200,148,28,0.30)' }}>
              <p className="text-[10px] font-bold tracking-widest mb-2.5" style={{ color: GOLD }}>COMPTES DE DÉMONSTRATION (DEV)</p>
              <div className="space-y-1.5">
                {DEMO_ACCOUNTS.map((a) => (
                  <button
                    key={a.email}
                    type="button"
                    onClick={() => setForm({ email: a.email, password: 'Antenn@123' })}
                    className="w-full flex items-center justify-between text-xs rounded-lg px-2.5 py-1.5 transition-colors"
                    style={{ color: 'rgba(255,255,255,0.55)' }}
                  >
                    <span>{a.role}</span>
                    <span className="font-mono" style={{ color: 'rgba(255,255,255,0.40)' }}>{a.email}</span>
                  </button>
                ))}
                <div className="flex justify-between text-xs pt-1.5 mt-1" style={{ borderTop: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.35)' }}>
                  <span>Mot de passe commun</span>
                  <span className="font-mono font-semibold" style={{ color: 'rgba(255,255,255,0.5)' }}>Antenn@123</span>
                </div>
              </div>
            </div>
          )}

          <p className="text-center text-xs mt-5" style={{ color: 'rgba(255,255,255,0.20)' }}>ANTENN · Haitech Solutions · 2026</p>
        </div>
      </div>
    </div>
  );
}
