'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Video, Mail, Lock, User, AlertCircle } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';

const MINT = '#17b892';
const MINT_BG = 'rgba(23,184,146,0.14)';
const MINT_BD = 'rgba(23,184,146,0.32)';

export default function RegisterPage() {
  const router = useRouter();
  const { register, isLoading, user } = useAuthStore();
  const [form, setForm] = useState({ nom: '', email: '', password: '' });
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) router.replace('/dashboard');
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await register(form.nom, form.email, form.password);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Impossible de créer le compte');
    }
  };

  const inputStyle = { background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: 'white' };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      <div className="blob-field">
        <div className="blob blob-violet" style={{ width: 420, height: 420, top: -140, right: -100 }} />
        <div className="blob blob-mint" style={{ width: 420, height: 420, bottom: -160, left: -100, animationDelay: '-9s' }} />
      </div>
      <div
        className="w-full relative animate-[fade-up_0.5s_ease-out]"
        style={{ maxWidth: 420, borderRadius: 20, background: 'rgba(14,22,46,0.68)', border: '1px solid rgba(255,255,255,0.1)', borderTopColor: 'rgba(255,255,255,0.22)', backdropFilter: 'blur(28px) saturate(160%)', WebkitBackdropFilter: 'blur(28px) saturate(160%)', boxShadow: '0 32px 80px rgba(0,0,0,0.6)', padding: '2.5rem', zIndex: 1 }}
      >
        <Link href="/" className="flex items-center gap-2.5 mb-8">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: MINT_BG, border: `1px solid ${MINT_BD}` }}>
            <Video className="w-4.5 h-4.5" style={{ color: MINT }} />
          </div>
          <span className="font-black text-lg text-white tracking-tight">REYINYON</span>
        </Link>

        <h2 className="text-2xl font-bold text-white mb-1">Créer un compte</h2>
        <p className="text-sm mb-7" style={{ color: 'rgba(255,255,255,0.45)' }}>Planifiez et animez vos propres réunions.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold tracking-widest mb-2" style={{ color: MINT }}>NOM</label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'rgba(255,255,255,0.35)' }} />
              <input required value={form.nom} onChange={(e) => setForm({ ...form, nom: e.target.value })} placeholder="Votre nom" className="w-full pl-10 pr-4 py-3 rounded-xl text-sm focus:outline-none" style={inputStyle} />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold tracking-widest mb-2" style={{ color: MINT }}>EMAIL</label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'rgba(255,255,255,0.35)' }} />
              <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="vous@exemple.com" autoComplete="email" className="w-full pl-10 pr-4 py-3 rounded-xl text-sm focus:outline-none" style={inputStyle} />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold tracking-widest mb-2" style={{ color: MINT }}>MOT DE PASSE</label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'rgba(255,255,255,0.35)' }} />
              <input type="password" required minLength={8} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="8 caractères minimum" autoComplete="new-password" className="w-full pl-10 pr-4 py-3 rounded-xl text-sm focus:outline-none" style={inputStyle} />
            </div>
          </div>

          {error && (
            <div className="flex items-start gap-2 p-3 rounded-xl text-sm" style={{ background: 'rgba(185,28,28,0.15)', border: '1px solid rgba(239,68,68,0.25)', color: '#fca5a5' }}>
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              {error}
            </div>
          )}

          <button type="submit" disabled={isLoading} className="w-full py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-50" style={{ background: MINT, color: '#04241c', marginTop: 8 }}>
            {isLoading ? 'Création...' : 'Créer mon compte'}
          </button>
        </form>

        <p className="text-center text-sm mt-6" style={{ color: 'rgba(255,255,255,0.45)' }}>
          Déjà un compte ? <Link href="/login" className="font-semibold" style={{ color: MINT }}>Se connecter</Link>
        </p>
      </div>
    </div>
  );
}
