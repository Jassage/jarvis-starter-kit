'use client';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';

const TIPS = [
  { categorie: 'SÉCURITÉ', texte: 'Verrouillez toujours votre session quand vous quittez votre poste. Ne communiquez jamais votre mot de passe.' },
  { categorie: 'CAISSE', texte: "N'oubliez pas de fermer votre caisse en fin de journée. Un arrêté non effectué bloque les rapports du lendemain." },
  { categorie: 'BONNE PRATIQUE', texte: 'Vérifiez toujours le montant avant de valider une transaction. Une erreur de saisie est difficile à corriger.' },
  { categorie: 'PRODUCTIVITÉ', texte: 'Utilisez Tab pour naviguer entre les champs du formulaire sans toucher la souris — plus rapide en caisse.' },
  { categorie: 'MULTI-DEVISES', texte: 'BANKA gère HTG et USD nativement. Configurez le taux de change quotidiennement pour la précision des rapports.' },
];

const DEMO_ACCOUNTS = [
  { role: 'Super Admin',  email: 'admin@banka.ht' },
  { role: 'Directeur',    email: 'directeur@banka.ht' },
  { role: 'Caissier',     email: 'caissier@banka.ht' },
];

const GOLD   = '#c8941c';
const GOLD_BG = 'rgba(200,148,28,0.10)';
const GOLD_BD = 'rgba(200,148,28,0.30)';

export default function LoginPage() {
  const router = useRouter();
  const { login, verify2FA, clearTwoFactor, isLoading, requiresTwoFactor } = useAuthStore();
  const [form, setForm]   = useState({ email: '', motDePasse: '' });
  const [otp,  setOtp]    = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [tipIndex, setTipIndex] = useState(0);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (requiresTwoFactor) otpRefs.current[0]?.focus();
  }, [requiresTwoFactor]);

  useEffect(() => {
    const t = setInterval(() => setTipIndex((i) => (i + 1) % TIPS.length), 5000);
    return () => clearInterval(t);
  }, []);

  const handleSubmit = async (e: { preventDefault(): void }) => {
    e.preventDefault();
    setError('');
    try {
      await login(form.email, form.motDePasse);
      if (!useAuthStore.getState().requiresTwoFactor) router.push('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Identifiants invalides');
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d?$/.test(value)) return;
    const next = [...otp];
    next[index] = value;
    setOtp(next);
    if (value && index < 5) otpRefs.current[index + 1]?.focus();
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) otpRefs.current[index - 1]?.focus();
    if (e.key === 'Enter') handleVerify();
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const digits = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6).split('');
    if (digits.length === 6) { setOtp(digits); otpRefs.current[5]?.focus(); }
  };

  const handleVerify = async () => {
    const code = otp.join('');
    if (code.length < 6) return;
    setError('');
    try {
      await verify2FA(code);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Code invalide');
      setOtp(['', '', '', '', '', '']);
      otpRefs.current[0]?.focus();
    }
  };

  const tip = TIPS[tipIndex];

  const inputStyle = {
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.12)',
    color: 'white',
  };
  const inputFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.style.borderColor = GOLD_BD;
    e.target.style.background  = GOLD_BG;
  };
  const inputBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.style.borderColor = 'rgba(255,255,255,0.12)';
    e.target.style.background  = 'rgba(255,255,255,0.06)';
  };

  /* ─── Panneau gauche ──────────────────────────────────────────────── */
  const LeftPanel = () => (
    <div
      className="hidden lg:flex flex-col justify-between p-10 relative overflow-hidden"
      style={{
        width: 380,
        minWidth: 380,
        background: 'rgba(255,255,255,0.03)',
        borderRight: '1px solid rgba(255,255,255,0.08)',
      }}
    >
      {/* Cercles déco */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden>
        <svg className="absolute -top-20 -left-20 opacity-[0.07]" width="320" height="320" viewBox="0 0 320 320" fill="none">
          <circle cx="160" cy="160" r="140" stroke="white" strokeWidth="1"/>
          <circle cx="160" cy="160" r="90"  stroke="white" strokeWidth="1"/>
          <circle cx="160" cy="160" r="40"  stroke="white" strokeWidth="1"/>
        </svg>
        <svg className="absolute bottom-0 right-0 opacity-[0.07]" width="200" height="200" viewBox="0 0 200 200" fill="none">
          <circle cx="200" cy="200" r="160" stroke="white" strokeWidth="1"/>
          <circle cx="200" cy="200" r="80"  stroke="white" strokeWidth="1"/>
        </svg>
      </div>

      {/* Logo + titre */}
      <div className="relative z-10 flex flex-col items-center text-center">
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center mb-5"
          style={{ background: 'rgba(200,148,28,0.15)', border: `2px solid ${GOLD_BD}` }}
        >
          <svg viewBox="0 0 24 24" fill="none" className="w-10 h-10">
            <path d="M3 21h18M5 21V8l7-4 7 4v13M9 21v-8h6v8M9 12h6" stroke={GOLD} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>

        <div
          className="flex items-center gap-1.5 px-4 py-1.5 rounded-full mb-6 text-xs font-bold tracking-widest"
          style={{ background: GOLD_BG, border: `1px solid ${GOLD_BD}`, color: GOLD }}
        >
          <span>★</span>
          <span>SYSTÈME BANCAIRE</span>
        </div>

        <h1 className="text-5xl font-black tracking-tight text-white mb-1">BANKA</h1>
        <p className="text-2xl font-semibold mb-4" style={{ color: GOLD, fontStyle: 'italic' }}>ERP Bancaire</p>
        <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.50)' }}>
          Plateforme intégrée de gestion bancaire.<br />
          Pignon, Nord — Haïti
        </p>
      </div>

      {/* Tips */}
      <div className="relative z-10">
        <div
          className="rounded-xl p-4"
          style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.07)',
            borderLeft: `3px solid #1e63d0`,
          }}
        >
          <div className="flex items-center justify-between mb-3">
            <span
              className="text-[10px] font-bold tracking-widest px-2 py-1 rounded"
              style={{ background: 'rgba(20,184,166,0.15)', color: '#2dd4bf' }}
            >
              {tip.categorie}
            </span>
            <div className="flex gap-1">
              {TIPS.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setTipIndex(i)}
                  className="rounded-full transition-all"
                  style={{
                    width: i === tipIndex ? 16 : 6,
                    height: 6,
                    background: i === tipIndex ? '#1e63d0' : 'rgba(255,255,255,0.2)',
                  }}
                />
              ))}
            </div>
          </div>
          <p className="text-sm italic leading-relaxed" style={{ color: 'rgba(255,255,255,0.72)' }}>
            {tip.texte}
          </p>
          <div className="flex justify-end gap-2 mt-3">
            <button
              onClick={() => setTipIndex((i) => (i - 1 + TIPS.length) % TIPS.length)}
              className="w-7 h-7 rounded-full flex items-center justify-center text-xs transition-colors"
              style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.6)' }}
            >
              ←
            </button>
            <button
              onClick={() => setTipIndex((i) => (i + 1) % TIPS.length)}
              className="w-7 h-7 rounded-full flex items-center justify-center text-xs transition-colors"
              style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.6)' }}
            >
              →
            </button>
          </div>
        </div>

        <p className="text-center text-xs mt-4" style={{ color: 'rgba(255,255,255,0.25)' }}>
          BANKA © 2026
        </p>
      </div>
    </div>
  );

  /* ─── Page principale ─────────────────────────────────────────────── */
  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 relative"
      style={{ background: 'linear-gradient(135deg, #050d1f 0%, #0b1733 45%, #0d2145 100%)' }}
    >
      {/* Grille de points */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.04) 1px, transparent 0)',
          backgroundSize: '40px 40px',
        }}
        aria-hidden
      />

      {/* Halos lumineux */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden>
        <div className="absolute w-96 h-96 rounded-full" style={{ background: 'radial-gradient(circle, rgba(37,99,235,0.12) 0%, transparent 70%)', top: '10%', left: '15%' }} />
        <div className="absolute w-80 h-80 rounded-full" style={{ background: `radial-gradient(circle, ${GOLD_BG} 0%, transparent 70%)`, bottom: '15%', right: '20%' }} />
      </div>

      {/* Carte principale */}
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
        <LeftPanel />

        {/* Panneau droit */}
        <div
          className="flex-1 flex flex-col justify-center p-10"
          style={{ background: 'rgba(255,255,255,0.02)' }}
        >
          {/* Logo mobile */}
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: GOLD_BG, border: `1px solid ${GOLD_BD}` }}>
              <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5"><path d="M3 21h18M5 21V8l7-4 7 4v13M9 21v-8h6v8M9 12h6" stroke={GOLD} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
            <span className="font-black text-xl text-white">BANKA</span>
          </div>

          {requiresTwoFactor ? (
            /* ─── Vue 2FA ─────────────────────────────────────────── */
            <>
              <p className="text-xs font-bold tracking-widest mb-2" style={{ color: GOLD }}>VÉRIFICATION</p>
              <h2 className="text-3xl font-bold text-white mb-1">Double authentification</h2>
              <p className="text-sm mb-8" style={{ color: 'rgba(255,255,255,0.45)' }}>
                Entrez le code à 6 chiffres de votre application d'authentification.
              </p>

              <div className="flex gap-2 mb-6" onPaste={handleOtpPaste}>
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    ref={(el) => { otpRefs.current[i] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(i, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(i, e)}
                    className="flex-1 h-14 text-center text-xl font-bold rounded-xl focus:outline-none transition-all"
                    style={{
                      background: digit ? GOLD_BG : 'rgba(255,255,255,0.06)',
                      border: `1px solid ${digit ? GOLD_BD : 'rgba(255,255,255,0.12)'}`,
                      color: 'white',
                    }}
                  />
                ))}
              </div>

              {error && <ErrorBanner message={error} />}

              <button
                onClick={handleVerify}
                disabled={isLoading || otp.join('').length < 6}
                className="w-full py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-40"
                style={{ background: GOLD, color: 'white' }}
              >
                {isLoading ? <Spinner /> : 'Vérifier le code'}
              </button>

              <button
                type="button"
                onClick={() => { clearTwoFactor(); setError(''); setOtp(['', '', '', '', '', '']); }}
                className="w-full text-sm text-center mt-4 py-2"
                style={{ color: 'rgba(255,255,255,0.35)' }}
              >
                ← Retour à la connexion
              </button>
            </>
          ) : (
            /* ─── Vue connexion ───────────────────────────────────── */
            <>
              <p className="text-xs font-bold tracking-widest mb-2" style={{ color: GOLD }}>PORTAIL BANCAIRE</p>
              <h2 className="text-3xl font-bold text-white mb-1">Connexion</h2>
              <p className="text-sm mb-8" style={{ color: 'rgba(255,255,255,0.45)' }}>
                Entrez vos identifiants pour accéder à votre espace.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Email */}
                <div>
                  <label className="block text-xs font-bold tracking-widest mb-2" style={{ color: GOLD }}>
                    ADRESSE EMAIL
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'rgba(255,255,255,0.35)' }}>
                      <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4">
                        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </span>
                    <input
                      type="email"
                      required
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder="vous@banka.ht"
                      autoComplete="email"
                      className="w-full pl-10 pr-4 py-3 rounded-xl text-sm focus:outline-none transition-all"
                      style={inputStyle}
                      onFocus={inputFocus}
                      onBlur={inputBlur}
                    />
                  </div>
                </div>

                {/* Mot de passe */}
                <div>
                  <label className="block text-xs font-bold tracking-widest mb-2" style={{ color: GOLD }}>
                    MOT DE PASSE
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'rgba(255,255,255,0.35)' }}>
                      <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4">
                        <rect x="5" y="11" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.8"/>
                        <path d="M8 11V7a4 4 0 018 0v4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                      </svg>
                    </span>
                    <input
                      type={showPwd ? 'text' : 'password'}
                      required
                      value={form.motDePasse}
                      onChange={(e) => setForm({ ...form, motDePasse: e.target.value })}
                      placeholder="••••••••"
                      autoComplete="current-password"
                      className="w-full pl-10 pr-12 py-3 rounded-xl text-sm focus:outline-none transition-all"
                      style={inputStyle}
                      onFocus={inputFocus}
                      onBlur={inputBlur}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPwd(!showPwd)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2"
                      style={{ color: 'rgba(255,255,255,0.35)' }}
                    >
                      {showPwd ? (
                        <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24M1 1l22 22" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
                      ) : (
                        <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/><circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.8"/></svg>
                      )}
                    </button>
                  </div>
                </div>

                {error && <ErrorBanner message={error} />}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                  style={{ background: GOLD, color: 'white', marginTop: 8 }}
                >
                  {isLoading ? <Spinner /> : 'Se connecter'}
                </button>
              </form>

              {/* Mot de passe oublié */}
              <div
                className="mt-5 p-3.5 rounded-xl text-xs space-y-1"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
              >
                <p style={{ color: 'rgba(255,255,255,0.45)' }}>
                  Mot de passe oublié ?{' '}
                  <a href="/reset-password/request" className="font-semibold hover:underline" style={{ color: GOLD }}>
                    Réinitialiser par email
                  </a>
                </p>
                <p style={{ color: 'rgba(255,255,255,0.35)' }}>
                  Problème de connexion ? Contactez le support système.
                </p>
              </div>

              {/* Comptes démo — DEV uniquement, jamais visible en production */}
              {process.env.NODE_ENV === 'development' && (
                <div className="mt-4 p-4 rounded-xl" style={{ background: GOLD_BG, border: `1px solid ${GOLD_BD}` }}>
                  <p className="text-[10px] font-bold tracking-widest mb-2.5" style={{ color: GOLD }}>COMPTES DE DÉMONSTRATION (DEV)</p>
                  <div className="space-y-1.5">
                    {DEMO_ACCOUNTS.map((a) => (
                      <button
                        key={a.email}
                        type="button"
                        onClick={() => setForm({ email: a.email, motDePasse: 'Admin@123' })}
                        className="w-full flex items-center justify-between text-xs rounded-lg px-2.5 py-1.5 transition-colors"
                        style={{ color: 'rgba(255,255,255,0.55)' }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.06)')}
                        onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                      >
                        <span>{a.role}</span>
                        <span className="font-mono" style={{ color: 'rgba(255,255,255,0.40)' }}>{a.email}</span>
                      </button>
                    ))}
                    <div className="flex justify-between text-xs pt-1.5 mt-1" style={{ borderTop: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.35)' }}>
                      <span>Mot de passe commun</span>
                      <span className="font-mono font-semibold" style={{ color: 'rgba(255,255,255,0.5)' }}>Admin@123</span>
                    </div>
                  </div>
                </div>
              )}

              <p className="text-center text-xs mt-5" style={{ color: 'rgba(255,255,255,0.20)' }}>
                BANKA · Pignon, Nord, Haïti · 2026
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function ErrorBanner({ message }: { message: string }) {
  return (
    <div
      className="flex items-start gap-2 p-3 rounded-xl text-sm"
      style={{ background: 'rgba(185,28,28,0.15)', border: '1px solid rgba(239,68,68,0.25)', color: '#fca5a5' }}
    >
      <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 shrink-0 mt-0.5">
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8"/>
        <path d="M12 8v4M12 16h.01" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
      </svg>
      {message}
    </div>
  );
}

function Spinner() {
  return (
    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.25"/>
      <path d="M22 12a10 10 0 01-10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
    </svg>
  );
}
