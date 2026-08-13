'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Pill, ArrowRight, ShieldCheck, Warehouse, ClipboardList } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { apiErrorMessage } from '@/lib/api';

const FEATURES = [
  { icon: Warehouse, title: 'Stock par lot', description: 'Traçabilité complète : numéro de lot, date de péremption, alertes automatiques' },
  { icon: ClipboardList, title: 'Catalogue structuré', description: 'DCI, dosage, forme pharmaceutique, seuils de réapprovisionnement' },
  { icon: ShieldCheck, title: 'Accès par rôle', description: 'Pharmacien, gérant, vendeur, magasinier — chacun son périmètre' },
];

const DEMO_ACCOUNTS = [
  { label: 'Super Admin', email: 'admin@remed.ht', motDePasse: 'ChangeMoi123!' },
  { label: 'Pharmacien', email: 'pharmacien@remed.ht', motDePasse: 'Pharmacien123!' },
];

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
    } catch (err) {
      setError(apiErrorMessage(err, 'Identifiants invalides'));
    }
  };

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--color-bg)' }}>
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden" style={{ background: 'var(--gradient-brand-deep)' }}>
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/10 backdrop-blur-sm border border-white/10 rounded-2xl flex items-center justify-center">
              <Pill className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">REMED</h1>
              <p className="text-xs text-white/60">Gestion de pharmacie</p>
            </div>
          </div>

          <div className="space-y-8">
            <div>
              <h2 className="text-4xl font-bold text-white leading-tight mb-3">
                Votre pharmacie,
                <br />
                <span className="text-white/70">sous contrôle</span>
              </h2>
              <p className="text-white/60 text-lg leading-relaxed">
                Catalogue, stock par lot, péremption et réapprovisionnement, dans un seul outil.
              </p>
            </div>

            <div className="grid gap-4">
              {FEATURES.map((feature) => (
                <div key={feature.title} className="p-4 rounded-2xl bg-white/5 border border-white/10">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-white/10 text-white">
                      <feature.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1 text-white">{feature.title}</h3>
                      <p className="text-sm text-white/60 leading-relaxed">{feature.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <p className="text-sm text-white/40">© {new Date().getFullYear()} REMED</p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-md">
          <div className="lg:hidden text-center mb-8">
            <div className="inline-flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: 'var(--gradient-brand)' }}>
                <Pill className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold" style={{ color: 'var(--color-ink)' }}>REMED</span>
            </div>
          </div>

          <div className="text-center lg:text-left mb-8">
            <h2 className="text-3xl font-bold mb-2" style={{ color: 'var(--color-ink)' }}>Connectez-vous</h2>
            <p style={{ color: 'var(--color-ink-3)' }}>Accédez à votre espace de gestion.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-medium" style={{ color: 'var(--color-ink-2)' }}>Adresse email</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="vous@remed.ht"
                autoComplete="email"
                className="input"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium" style={{ color: 'var(--color-ink-2)' }}>Mot de passe</label>
              <div className="relative">
                <input
                  type={showPwd ? 'text' : 'password'}
                  required
                  value={form.motDePasse}
                  onChange={(e) => setForm({ ...form, motDePasse: e.target.value })}
                  placeholder="Entrez votre mot de passe"
                  autoComplete="current-password"
                  className="input pr-11"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg"
                  style={{ color: 'var(--color-ink-3)' }}
                  aria-label={showPwd ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                >
                  {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-xl text-sm" style={{ background: 'var(--color-danger-soft)', color: 'var(--color-danger)' }}>
                {error}
              </div>
            )}

            <button type="submit" disabled={isLoading} className="btn btn-primary w-full py-3">
              {isLoading ? 'Connexion en cours...' : (
                <>
                  Se connecter
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {process.env.NODE_ENV === 'development' && (
            <div className="mt-8 p-4 rounded-xl" style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-line)' }}>
              <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--color-ink-3)' }}>
                Comptes de démonstration
              </p>
              <div className="space-y-2">
                {DEMO_ACCOUNTS.map((acc) => (
                  <button
                    key={acc.email}
                    type="button"
                    onClick={() => setForm({ email: acc.email, motDePasse: acc.motDePasse })}
                    className="w-full p-3 rounded-lg text-left transition-colors"
                    style={{ background: 'var(--color-surface)', border: '1px solid var(--color-line)' }}
                  >
                    <div className="text-sm font-semibold" style={{ color: 'var(--color-ink)' }}>{acc.label}</div>
                    <div className="text-xs" style={{ color: 'var(--color-ink-3)' }}>{acc.email}</div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
