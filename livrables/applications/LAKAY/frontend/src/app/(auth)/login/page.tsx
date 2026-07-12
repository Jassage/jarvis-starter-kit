'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Home, Loader2 } from 'lucide-react';
import { useAuthStore } from '../../../store/authStore';

const schema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(1, 'Mot de passe requis'),
});

type Form = z.infer<typeof schema>;

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuthStore();
  const [showPass, setShowPass] = useState(false);
  const [serverError, setServerError] = useState('');

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<Form>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: Form) => {
    setServerError('');
    try {
      await login(data.email, data.password);
      router.push('/dashboard');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Identifiants incorrects';
      setServerError(msg);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Panneau gauche — visuel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-navy-600 to-navy-500 text-white flex-col justify-between p-12">
        <Link href="/" className="flex items-center gap-2 font-display font-bold text-xl">
          <div className="w-9 h-9 bg-primary-500 rounded-xl flex items-center justify-center">
            <Home className="w-5 h-5" />
          </div>
          LAKAY
        </Link>
        <div>
          <h2 className="text-3xl font-display font-bold leading-tight mb-4">
            La plateforme immobilière<br />de référence en Haïti
          </h2>
          <p className="text-gray-300 text-sm">
            Des milliers d'annonces vérifiées dans tous les 10 départements d'Haïti.
          </p>
          <div className="grid grid-cols-3 gap-4 mt-8">
            {[{ v: '2K+', l: 'Annonces' }, { v: '150+', l: 'Agences' }, { v: '10', l: 'Départements' }].map((s) => (
              <div key={s.l} className="bg-white/10 rounded-xl p-4 text-center">
                <p className="font-bold text-2xl text-primary-400">{s.v}</p>
                <p className="text-xs text-gray-400 mt-1">{s.l}</p>
              </div>
            ))}
          </div>
        </div>
        <p className="text-gray-400 text-xs">© {new Date().getFullYear()} LAKAY. Tous droits réservés.</p>
      </div>

      {/* Panneau droit — formulaire */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-12 bg-gray-50">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <Link href="/" className="flex lg:hidden items-center gap-2 font-display font-bold text-xl text-primary-500 mb-8 justify-center">
            <div className="w-9 h-9 bg-primary-500 rounded-xl flex items-center justify-center">
              <Home className="w-5 h-5 text-white" />
            </div>
            LAKAY
          </Link>

          <h1 className="text-2xl font-display font-bold text-gray-900 mb-2">Bienvenue !</h1>
          <p className="text-gray-500 text-sm mb-8">
            Pas encore de compte ? <Link href="/register" className="text-primary-500 font-medium hover:underline">S'inscrire</Link>
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">Email</label>
              <input
                {...register('email')}
                type="email"
                autoComplete="email"
                placeholder="votre@email.com"
                className="input"
              />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">Mot de passe</label>
              <div className="relative">
                <input
                  {...register('password')}
                  type={showPass ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className="input pr-10"
                />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
            </div>

            <div className="flex justify-end">
              <Link href="/forgot-password" className="text-xs text-primary-500 hover:underline">
                Mot de passe oublié ?
              </Link>
            </div>

            {serverError && (
              <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg border border-red-100">
                {serverError}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full btn-primary py-3 flex items-center justify-center gap-2"
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              {isSubmitting ? 'Connexion...' : 'Se connecter'}
            </button>
          </form>

          <p className="text-center text-xs text-gray-400 mt-6">
            En vous connectant, vous acceptez nos{' '}
            <Link href="/legal/terms" className="hover:underline">Conditions d'utilisation</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
