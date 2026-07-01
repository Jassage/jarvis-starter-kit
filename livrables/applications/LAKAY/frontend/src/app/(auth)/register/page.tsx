'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Home, Loader2, CheckCircle2 } from 'lucide-react';
import { authApi } from '../../../lib/api';
import { cn } from '../../../lib/utils';

const schema = z.object({
  firstName: z.string().min(2, 'Prénom requis (min 2 car.)'),
  lastName: z.string().min(2, 'Nom requis (min 2 car.)'),
  email: z.string().email('Email invalide'),
  phone: z.string().optional(),
  role: z.enum(['INDIVIDUAL', 'OWNER', 'AGENCY']),
  password: z.string().min(8).regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/,
    'Doit contenir maj, min, chiffre et caractère spécial'
  ),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  message: 'Les mots de passe ne correspondent pas',
  path: ['confirmPassword'],
});

type Form = z.infer<typeof schema>;

const ROLES = [
  { value: 'INDIVIDUAL', label: 'Particulier', desc: 'Je cherche un bien', icon: '👤' },
  { value: 'OWNER', label: 'Propriétaire', desc: 'Je mets en location/vente', icon: '🏠' },
  { value: 'AGENCY', label: 'Agence', desc: 'Je représente une agence', icon: '🏢' },
];

export default function RegisterPage() {
  const router = useRouter();
  const [showPass, setShowPass] = useState(false);
  const [success, setSuccess] = useState(false);
  const [serverError, setServerError] = useState('');

  const { register, handleSubmit, watch, setValue, formState: { errors, isSubmitting } } = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: { role: 'INDIVIDUAL' },
  });

  const selectedRole = watch('role');

  const onSubmit = async (data: Form) => {
    setServerError('');
    try {
      const { confirmPassword, ...rest } = data;
      await authApi.register(rest);
      setSuccess(true);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Erreur lors de l\'inscription';
      setServerError(msg);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
        <div className="max-w-md w-full text-center bg-white rounded-2xl p-10 shadow-sm border border-gray-100">
          <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-display font-bold text-gray-900 mb-3">Compte créé !</h2>
          <p className="text-gray-500 mb-6">Un email de vérification a été envoyé. Vérifiez votre boîte mail pour activer votre compte.</p>
          <Link href="/login" className="btn-primary inline-block px-8 py-3">Se connecter</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      {/* Panneau gauche */}
      <div className="hidden lg:flex lg:w-5/12 bg-gradient-to-br from-navy-600 to-navy-500 text-white flex-col justify-between p-12">
        <Link href="/" className="flex items-center gap-2 font-display font-bold text-xl">
          <div className="w-9 h-9 bg-primary-500 rounded-xl flex items-center justify-center">
            <Home className="w-5 h-5" />
          </div>
          LAKAY
        </Link>
        <div>
          <h2 className="text-3xl font-display font-bold leading-tight mb-4">
            Rejoignez la communauté<br />immobilière haïtienne
          </h2>
          <ul className="space-y-3 text-gray-300 text-sm">
            {['Publiez vos annonces gratuitement', 'Contactez directement les propriétaires', 'Accédez aux meilleurs biens', 'Gérez vos favoris et demandes'].map((item) => (
              <li key={item} className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-primary-400 shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>
        <p className="text-gray-400 text-xs">© {new Date().getFullYear()} LAKAY</p>
      </div>

      {/* Panneau droit */}
      <div className="flex-1 overflow-y-auto flex flex-col items-center justify-center p-6 sm:p-12 bg-gray-50">
        <div className="w-full max-w-lg">
          <Link href="/" className="flex lg:hidden items-center gap-2 font-display font-bold text-xl text-primary-500 mb-8 justify-center">
            <div className="w-9 h-9 bg-primary-500 rounded-xl flex items-center justify-center">
              <Home className="w-5 h-5 text-white" />
            </div>
            LAKAY
          </Link>

          <h1 className="text-2xl font-display font-bold text-gray-900 mb-2">Créer un compte</h1>
          <p className="text-gray-500 text-sm mb-6">
            Déjà inscrit ? <Link href="/login" className="text-primary-500 font-medium hover:underline">Se connecter</Link>
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Rôle */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Je suis...</label>
              <div className="grid grid-cols-3 gap-2">
                {ROLES.map((role) => (
                  <button
                    type="button"
                    key={role.value}
                    onClick={() => setValue('role', role.value as Form['role'])}
                    className={cn(
                      'flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all text-center',
                      selectedRole === role.value
                        ? 'border-primary-500 bg-primary-50 text-primary-700'
                        : 'border-gray-200 text-gray-600 hover:border-gray-300'
                    )}
                  >
                    <span className="text-xl">{role.icon}</span>
                    <span className="font-semibold text-xs">{role.label}</span>
                    <span className="text-xs text-gray-400 hidden sm:block">{role.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Nom/Prénom */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">Prénom</label>
                <input {...register('firstName')} placeholder="Jean" className="input" />
                {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName.message}</p>}
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">Nom</label>
                <input {...register('lastName')} placeholder="Pierre" className="input" />
                {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName.message}</p>}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">Email</label>
              <input {...register('email')} type="email" placeholder="jean.pierre@email.com" className="input" />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">Téléphone (optionnel)</label>
              <input {...register('phone')} type="tel" placeholder="+509 4XXX-XXXX" className="input" />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">Mot de passe</label>
              <div className="relative">
                <input
                  {...register('password')}
                  type={showPass ? 'text' : 'password'}
                  placeholder="Min. 8 caractères avec maj, min, chiffre et spécial"
                  className="input pr-10"
                />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">Confirmer le mot de passe</label>
              <input {...register('confirmPassword')} type="password" placeholder="••••••••" className="input" />
              {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword.message}</p>}
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
              {isSubmitting ? 'Création...' : 'Créer mon compte'}
            </button>
          </form>

          <p className="text-center text-xs text-gray-400 mt-4">
            En vous inscrivant, vous acceptez nos{' '}
            <Link href="/legal/terms" className="hover:underline">CGU</Link> et{' '}
            <Link href="/legal/privacy" className="hover:underline">Politique de confidentialité</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
