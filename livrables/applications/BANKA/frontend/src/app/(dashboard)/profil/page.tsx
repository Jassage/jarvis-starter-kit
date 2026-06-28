'use client';
import { useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useToastStore } from '@/stores/toastStore';
import api from '@/lib/api';
import Tooltip from '@/components/ui/Tooltip';
import Image from 'next/image';

const ROLE_META: Record<string, { label: string; color: string; bg: string }> = {
  SUPER_ADMIN:  { label: 'Super Administrateur', color: '#6d28d9', bg: '#f5f3ff' },
  DIRECTEUR:    { label: 'Directeur',            color: '#1e40af', bg: '#eef2ff' },
  SUPERVISEUR:  { label: 'Superviseur',          color: '#0e7490', bg: '#ecfeff' },
  CAISSIER:     { label: 'Caissier',             color: '#047857', bg: '#ecfdf5' },
  AGENT_CREDIT: { label: 'Agent de crédit',      color: '#b45309', bg: '#fffbeb' },
  COMPTABLE:    { label: 'Comptable',            color: '#374151', bg: '#f3f4f6' },
  AUDITEUR:     { label: 'Auditeur',             color: '#1e40af', bg: '#eef2ff' },
};

type TwoFAStep = 'idle' | 'setup' | 'confirm' | 'disable';

export default function ProfilPage() {
  const { utilisateur, setUser } = useAuthStore();
  const toast = useToastStore();
  const [form, setForm] = useState({ ancienMotDePasse: '', nouveauMotDePasse: '', confirmation: '' });
  const [loading, setLoading] = useState(false);
  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  // 2FA state
  const [twoFAStep, setTwoFAStep] = useState<TwoFAStep>('idle');
  const [twoFAData, setTwoFAData] = useState<{ secret: string; qrCodeDataUrl: string } | null>(null);
  const [twoFACode, setTwoFACode] = useState('');
  const [twoFAPassword, setTwoFAPassword] = useState('');
  const [twoFALoading, setTwoFALoading] = useState(false);

  const roleMeta = ROLE_META[utilisateur?.role || ''] || { label: utilisateur?.role, color: '#4a5578', bg: '#f7f8fc' };

  const handleSetup2FA = async () => {
    setTwoFALoading(true);
    try {
      const { data } = await api.post('/auth/2fa/setup');
      setTwoFAData(data.data);
      setTwoFAStep('confirm');
    } catch (err: any) {
      toast.error('Erreur', err.response?.data?.error || 'Impossible de configurer la 2FA');
    } finally {
      setTwoFALoading(false);
    }
  };

  const handleEnable2FA = async () => {
    if (twoFACode.length !== 6) return;
    setTwoFALoading(true);
    try {
      await api.post('/auth/2fa/enable', { code: twoFACode });
      toast.success('2FA activée', 'La double authentification est maintenant active.');
      setTwoFAStep('idle');
      setTwoFACode('');
      setTwoFAData(null);
      const { data } = await api.get('/auth/me');
      setUser(data.data);
    } catch (err: any) {
      toast.error('Code invalide', err.response?.data?.error || 'Vérifiez le code et réessayez.');
    } finally {
      setTwoFALoading(false);
    }
  };

  const handleDisable2FA = async () => {
    if (twoFACode.length !== 6 || !twoFAPassword) return;
    setTwoFALoading(true);
    try {
      await api.post('/auth/2fa/disable', { motDePasse: twoFAPassword, code: twoFACode });
      toast.success('2FA désactivée', 'La double authentification a été désactivée.');
      setTwoFAStep('idle');
      setTwoFACode('');
      setTwoFAPassword('');
      const { data } = await api.get('/auth/me');
      setUser(data.data);
    } catch (err: any) {
      toast.error('Échec', err.response?.data?.error || 'Mot de passe ou code incorrect.');
    } finally {
      setTwoFALoading(false);
    }
  };

  const handleChangeMdp = async () => {
    if (!form.ancienMotDePasse || !form.nouveauMotDePasse) {
      toast.warning('Champs manquants', 'Remplissez tous les champs.');
      return;
    }
    if (form.nouveauMotDePasse.length < 8) {
      toast.warning('Mot de passe trop court', 'Le nouveau mot de passe doit faire au moins 8 caractères.');
      return;
    }
    if (form.nouveauMotDePasse !== form.confirmation) {
      toast.error('Mots de passe différents', 'La confirmation ne correspond pas au nouveau mot de passe.');
      return;
    }
    setLoading(true);
    try {
      await api.put('/auth/me/password', {
        ancienMotDePasse: form.ancienMotDePasse,
        nouveauMotDePasse: form.nouveauMotDePasse,
      });
      toast.success('Mot de passe modifié', 'Votre mot de passe a été mis à jour avec succès.');
      setForm({ ancienMotDePasse: '', nouveauMotDePasse: '', confirmation: '' });
    } catch (err: any) {
      toast.error('Échec', err.response?.data?.error || 'Ancien mot de passe incorrect.');
    } finally {
      setLoading(false);
    }
  };

  if (!utilisateur) return null;

  return (
    <div className="space-y-5 animate-slide-up">
      <div>
        <h1 className="text-xl font-bold" style={{ color: '#0b1733' }}>Mon profil</h1>
        <p className="text-sm mt-0.5" style={{ color: '#8b94b0' }}>Informations de votre compte et sécurité</p>
      </div>

      {/* Carte identité */}
      <div className="card overflow-hidden">
        <div className="px-6 py-5 flex items-center gap-5" style={{ background: 'linear-gradient(135deg, #1e3a8a, #2563eb)' }}>
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-white text-xl font-bold flex-shrink-0" style={{ background: 'rgba(255,255,255,0.2)' }}>
            {utilisateur.prenom?.[0]}{utilisateur.nom?.[0]}
          </div>
          <div>
            <h2 className="text-xl font-bold" style={{ color: 'white' }}>{utilisateur.prenom} {utilisateur.nom}</h2>
            <p className="text-sm mt-0.5" style={{ color: 'rgba(255,255,255,0.7)' }}>{utilisateur.email}</p>
            <span className="inline-block mt-2 px-2.5 py-0.5 rounded-full text-xs font-bold" style={{ background: 'rgba(255,255,255,0.2)', color: 'white' }}>
              {roleMeta.label}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 divide-x" style={{ borderTop: '1px solid #f0f2f9' }}>
          <div className="px-5 py-4">
            <p className="text-xs font-medium" style={{ color: '#8b94b0' }}>Agence</p>
            <p className="font-semibold mt-0.5" style={{ color: '#0b1733' }}>{utilisateur.agence?.nom || 'Siège'}</p>
          </div>
          <div className="px-5 py-4">
            <p className="text-xs font-medium" style={{ color: '#8b94b0' }}>Rôle</p>
            <span className="inline-block mt-0.5 px-2 py-0.5 rounded-full text-xs font-bold" style={{ background: roleMeta.bg, color: roleMeta.color }}>
              {roleMeta.label}
            </span>
          </div>
        </div>
      </div>

      {/* Changement mot de passe */}
      <div className="card p-5">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: '#eef2ff' }}>
            <svg viewBox="0 0 24 24" fill="none" className="w-4.5 h-4.5 w-5 h-5" style={{ color: '#2563eb' }}>
              <rect x="3" y="11" width="18" height="11" rx="2" stroke="currentColor" strokeWidth="1.8"/>
              <path d="M7 11V7a5 5 0 0110 0v4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
            </svg>
          </div>
          <div>
            <h3 className="font-bold" style={{ color: '#0b1733' }}>Changer mon mot de passe</h3>
            <p className="text-xs" style={{ color: '#8b94b0' }}>Sécurisez votre accès avec un nouveau mot de passe fort</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <div className="flex items-center gap-1.5 mb-1.5">
              <label className="label mb-0">Mot de passe actuel</label>
              <Tooltip content="Entrez votre mot de passe actuel pour confirmer votre identité" position="right">
                <svg viewBox="0 0 24 24" fill="none" className="w-3.5 h-3.5" style={{ color: '#8b94b0' }}><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8"/><path d="M12 8v4M12 16h.01" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
              </Tooltip>
            </div>
            <input type="password" value={form.ancienMotDePasse} onChange={(e) => set('ancienMotDePasse', e.target.value)} className="input" placeholder="••••••••" />
          </div>

          <div>
            <div className="flex items-center gap-1.5 mb-1.5">
              <label className="label mb-0">Nouveau mot de passe</label>
              <Tooltip content="Minimum 8 caractères. Utilisez des chiffres et des lettres pour plus de sécurité." position="right">
                <svg viewBox="0 0 24 24" fill="none" className="w-3.5 h-3.5" style={{ color: '#8b94b0' }}><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8"/><path d="M12 8v4M12 16h.01" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
              </Tooltip>
            </div>
            <input type="password" value={form.nouveauMotDePasse} onChange={(e) => set('nouveauMotDePasse', e.target.value)} className="input" placeholder="Minimum 8 caractères" />
            {form.nouveauMotDePasse && (
              <div className="mt-1.5 flex gap-1">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="flex-1 h-1 rounded-full" style={{
                    background: form.nouveauMotDePasse.length >= (i + 1) * 2
                      ? i < 1 ? '#ef4444' : i < 2 ? '#f59e0b' : i < 3 ? '#10b981' : '#047857'
                      : '#e7eaf3'
                  }} />
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="label">Confirmer le nouveau mot de passe</label>
            <input
              type="password"
              value={form.confirmation}
              onChange={(e) => set('confirmation', e.target.value)}
              className="input"
              placeholder="Répétez le nouveau mot de passe"
              style={{ borderColor: form.confirmation && form.confirmation !== form.nouveauMotDePasse ? '#fca5a5' : undefined }}
            />
            {form.confirmation && form.confirmation !== form.nouveauMotDePasse && (
              <p className="text-xs mt-1" style={{ color: '#b91c1c' }}>Les mots de passe ne correspondent pas</p>
            )}
          </div>

          <button
            onClick={handleChangeMdp}
            disabled={loading || !form.ancienMotDePasse || !form.nouveauMotDePasse || form.nouveauMotDePasse !== form.confirmation}
            className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <><svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.25"/><path d="M22 12a10 10 0 01-10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/></svg>Modification...</>
            ) : (
              <><svg viewBox="0 0 24 24" fill="none" className="w-4 h-4"><rect x="3" y="11" width="18" height="11" rx="2" stroke="white" strokeWidth="2"/><path d="M7 11V7a5 5 0 0110 0v4" stroke="white" strokeWidth="2" strokeLinecap="round"/></svg>Modifier le mot de passe</>
            )}
          </button>
        </div>
      </div>
      {/* Double authentification */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: utilisateur?.twoFactorEnabled ? '#ecfdf5' : '#f7f8fc' }}>
              <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" style={{ color: utilisateur?.twoFactorEnabled ? '#047857' : '#4a5578' }}>
                <path d="M12 2L3 7v5c0 5.25 3.75 10.15 9 11.35C17.25 22.15 21 17.25 21 12V7l-9-5z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/>
                {utilisateur?.twoFactorEnabled && <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>}
              </svg>
            </div>
            <div>
              <h3 className="font-bold" style={{ color: '#0b1733' }}>Double authentification (2FA)</h3>
              <p className="text-xs" style={{ color: '#8b94b0' }}>Couche de sécurité supplémentaire via Google Authenticator ou Authy</p>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-full text-xs font-bold" style={{
            background: utilisateur?.twoFactorEnabled ? '#ecfdf5' : '#f3f4f6',
            color: utilisateur?.twoFactorEnabled ? '#047857' : '#6b7280',
          }}>
            {utilisateur?.twoFactorEnabled ? 'Activée' : 'Désactivée'}
          </span>
        </div>

        {/* Idle state */}
        {twoFAStep === 'idle' && (
          <div>
            {utilisateur?.twoFactorEnabled ? (
              <button
                onClick={() => setTwoFAStep('disable')}
                className="w-full py-2.5 rounded-xl text-sm font-semibold border transition-colors"
                style={{ borderColor: '#fca5a5', color: '#b91c1c', background: '#fef2f2' }}
              >
                Désactiver la 2FA
              </button>
            ) : (
              <button
                onClick={() => setTwoFAStep('setup')}
                className="btn-primary w-full py-2.5 flex items-center justify-center gap-2"
              >
                <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4"><path d="M12 2L3 7v5c0 5.25 3.75 10.15 9 11.35C17.25 22.15 21 17.25 21 12V7l-9-5z" stroke="white" strokeWidth="1.8" strokeLinejoin="round"/></svg>
                Activer la 2FA
              </button>
            )}
          </div>
        )}

        {/* Setup step */}
        {twoFAStep === 'setup' && (
          <div className="space-y-3">
            <p className="text-sm" style={{ color: '#4a5578' }}>
              Installez <strong>Google Authenticator</strong> ou <strong>Authy</strong>, puis cliquez sur "Continuer" pour obtenir le QR code à scanner.
            </p>
            <div className="flex gap-2">
              <button onClick={() => setTwoFAStep('idle')} className="flex-1 py-2.5 rounded-xl text-sm font-semibold border" style={{ borderColor: '#e7eaf3', color: '#4a5578' }}>
                Annuler
              </button>
              <button onClick={handleSetup2FA} disabled={twoFALoading} className="flex-1 btn-primary py-2.5 flex items-center justify-center gap-2">
                {twoFALoading ? <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.25"/><path d="M22 12a10 10 0 01-10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/></svg> : null}
                Continuer
              </button>
            </div>
          </div>
        )}

        {/* Confirm step (scan QR + enter code) */}
        {twoFAStep === 'confirm' && twoFAData && (
          <div className="space-y-4">
            <div className="flex flex-col items-center gap-3 p-4 rounded-xl" style={{ background: '#f7f8fc' }}>
              <Image src={twoFAData.qrCodeDataUrl} alt="QR code 2FA" width={160} height={160} unoptimized />
              <div className="text-center">
                <p className="text-xs font-medium mb-1" style={{ color: '#8b94b0' }}>OU entrez la clé manuellement</p>
                <p className="font-mono text-sm font-bold tracking-widest" style={{ color: '#0b1733' }}>{twoFAData.secret}</p>
              </div>
            </div>
            <div>
              <label className="label">Code de confirmation (6 chiffres)</label>
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={twoFACode}
                onChange={(e) => setTwoFACode(e.target.value.replace(/\D/g, ''))}
                className="input font-mono tracking-widest text-center text-lg"
                placeholder="000000"
                onKeyDown={(e) => { if (e.key === 'Enter') handleEnable2FA(); }}
              />
            </div>
            <div className="flex gap-2">
              <button onClick={() => { setTwoFAStep('idle'); setTwoFACode(''); setTwoFAData(null); }} className="flex-1 py-2.5 rounded-xl text-sm font-semibold border" style={{ borderColor: '#e7eaf3', color: '#4a5578' }}>
                Annuler
              </button>
              <button onClick={handleEnable2FA} disabled={twoFALoading || twoFACode.length !== 6} className="flex-1 btn-primary py-2.5 flex items-center justify-center gap-2 disabled:opacity-50">
                {twoFALoading ? <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.25"/><path d="M22 12a10 10 0 01-10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/></svg> : null}
                Activer
              </button>
            </div>
          </div>
        )}

        {/* Disable step */}
        {twoFAStep === 'disable' && (
          <div className="space-y-4">
            <div className="p-3 rounded-xl" style={{ background: '#fef2f2', border: '1px solid #fecaca' }}>
              <p className="text-sm font-medium" style={{ color: '#b91c1c' }}>Désactiver la 2FA réduit la sécurité de votre compte. Confirmez avec votre mot de passe et votre code actuel.</p>
            </div>
            <div>
              <label className="label">Mot de passe</label>
              <input type="password" value={twoFAPassword} onChange={(e) => setTwoFAPassword(e.target.value)} className="input" placeholder="••••••••" />
            </div>
            <div>
              <label className="label">Code 2FA actuel (6 chiffres)</label>
              <input type="text" inputMode="numeric" maxLength={6} value={twoFACode} onChange={(e) => setTwoFACode(e.target.value.replace(/\D/g, ''))} className="input font-mono tracking-widest text-center text-lg" placeholder="000000" />
            </div>
            <div className="flex gap-2">
              <button onClick={() => { setTwoFAStep('idle'); setTwoFACode(''); setTwoFAPassword(''); }} className="flex-1 py-2.5 rounded-xl text-sm font-semibold border" style={{ borderColor: '#e7eaf3', color: '#4a5578' }}>
                Annuler
              </button>
              <button onClick={handleDisable2FA} disabled={twoFALoading || twoFACode.length !== 6 || !twoFAPassword} className="flex-1 py-2.5 rounded-xl text-sm font-semibold disabled:opacity-50 flex items-center justify-center gap-2" style={{ background: '#fef2f2', color: '#b91c1c', border: '1px solid #fca5a5' }}>
                {twoFALoading ? <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.25"/><path d="M22 12a10 10 0 01-10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/></svg> : null}
                Désactiver
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
