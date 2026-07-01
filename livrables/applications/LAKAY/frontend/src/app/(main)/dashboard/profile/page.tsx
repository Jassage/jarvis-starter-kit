'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { authApi } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';

const profileSchema = z.object({
  firstName: z.string().min(2, 'Minimum 2 caractères'),
  lastName: z.string().min(2, 'Minimum 2 caractères'),
  phone: z.string().optional(),
  bio: z.string().max(500).optional(),
  whatsapp: z.string().optional(),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Mot de passe actuel requis'),
  newPassword: z.string()
    .min(8, 'Minimum 8 caractères')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/, 'Doit contenir maj, min, chiffre et caractère spécial'),
  confirmPassword: z.string(),
}).refine(d => d.newPassword === d.confirmPassword, {
  message: 'Les mots de passe ne correspondent pas',
  path: ['confirmPassword'],
});

type ProfileForm = z.infer<typeof profileSchema>;
type PasswordForm = z.infer<typeof passwordSchema>;

export default function ProfilePage() {
  const { user, setUser } = useAuthStore();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'info' | 'password'>('info');
  const [successMessage, setSuccessMessage] = useState('');

  const profileForm = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      phone: user?.phone || '',
      bio: user?.bio || '',
      whatsapp: user?.whatsapp || '',
    },
  });

  const passwordForm = useForm<PasswordForm>({
    resolver: zodResolver(passwordSchema),
  });

  const updateProfileMutation = useMutation({
    mutationFn: (data: ProfileForm) => authApi.updateProfile(data),
    onSuccess: (res) => {
      setUser(res.data.user);
      queryClient.invalidateQueries({ queryKey: ['me'] });
      setSuccessMessage('Profil mis à jour.');
      setTimeout(() => setSuccessMessage(''), 3000);
    },
  });

  const changePasswordMutation = useMutation({
    mutationFn: (data: PasswordForm) => authApi.changePassword({
      currentPassword: data.currentPassword,
      newPassword: data.newPassword,
    }),
    onSuccess: () => {
      passwordForm.reset();
      setSuccessMessage('Mot de passe modifié.');
      setTimeout(() => setSuccessMessage(''), 3000);
    },
  });

  const ROLE_LABELS: Record<string, string> = {
    SUPER_ADMIN: 'Super Administrateur',
    ADMIN: 'Administrateur',
    AGENCY: 'Agence immobilière',
    AGENT: 'Agent immobilier',
    OWNER: 'Propriétaire',
    INDIVIDUAL: 'Particulier',
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Mon profil</h1>

      {/* Avatar + infos rapides */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6 flex items-center gap-5">
        <div className="w-16 h-16 rounded-full bg-navy text-white text-2xl font-bold flex items-center justify-center flex-shrink-0">
          {user?.firstName?.[0]}{user?.lastName?.[0]}
        </div>
        <div>
          <p className="text-lg font-semibold text-gray-900">{user?.firstName} {user?.lastName}</p>
          <p className="text-sm text-gray-500">{user?.email}</p>
          <span className="inline-block mt-1 text-xs font-medium px-2.5 py-1 bg-primary/10 text-primary rounded-full">
            {ROLE_LABELS[user?.role || ''] || user?.role}
          </span>
        </div>
      </div>

      {/* Onglets */}
      <div className="flex border-b border-gray-200 mb-6">
        {[
          { key: 'info', label: 'Informations' },
          { key: 'password', label: 'Mot de passe' },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as 'info' | 'password')}
            className={`px-5 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.key
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {successMessage && (
        <div className="mb-4 px-4 py-3 bg-green-50 border border-green-200 text-green-700 rounded-xl text-sm flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          {successMessage}
        </div>
      )}

      {activeTab === 'info' && (
        <form
          onSubmit={profileForm.handleSubmit(d => updateProfileMutation.mutate(d))}
          className="bg-white rounded-2xl border border-gray-200 p-6 space-y-5"
        >
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Prénom *</label>
              <input
                {...profileForm.register('firstName')}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
              />
              {profileForm.formState.errors.firstName && (
                <p className="text-red-500 text-xs mt-1">{profileForm.formState.errors.firstName.message}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nom *</label>
              <input
                {...profileForm.register('lastName')}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
              />
              {profileForm.formState.errors.lastName && (
                <p className="text-red-500 text-xs mt-1">{profileForm.formState.errors.lastName.message}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
            <input
              {...profileForm.register('phone')}
              placeholder="+509 XXXX-XXXX"
              className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp</label>
            <input
              {...profileForm.register('whatsapp')}
              placeholder="+509 XXXX-XXXX"
              className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Biographie</label>
            <textarea
              {...profileForm.register('bio')}
              rows={3}
              placeholder="Parlez un peu de vous..."
              className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              value={user?.email || ''}
              disabled
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50 text-gray-400 cursor-not-allowed"
            />
            <p className="text-xs text-gray-400 mt-1">L'email ne peut pas être modifié.</p>
          </div>

          <button
            type="submit"
            disabled={updateProfileMutation.isPending}
            className="w-full py-2.5 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-60"
          >
            {updateProfileMutation.isPending ? 'Enregistrement...' : 'Sauvegarder les modifications'}
          </button>

          {updateProfileMutation.isError && (
            <p className="text-red-600 text-sm text-center">Erreur lors de la mise à jour.</p>
          )}
        </form>
      )}

      {activeTab === 'password' && (
        <form
          onSubmit={passwordForm.handleSubmit(d => changePasswordMutation.mutate(d))}
          className="bg-white rounded-2xl border border-gray-200 p-6 space-y-5"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mot de passe actuel *</label>
            <input
              type="password"
              {...passwordForm.register('currentPassword')}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
            />
            {passwordForm.formState.errors.currentPassword && (
              <p className="text-red-500 text-xs mt-1">{passwordForm.formState.errors.currentPassword.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nouveau mot de passe *</label>
            <input
              type="password"
              {...passwordForm.register('newPassword')}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
            />
            {passwordForm.formState.errors.newPassword && (
              <p className="text-red-500 text-xs mt-1">{passwordForm.formState.errors.newPassword.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirmer le mot de passe *</label>
            <input
              type="password"
              {...passwordForm.register('confirmPassword')}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
            />
            {passwordForm.formState.errors.confirmPassword && (
              <p className="text-red-500 text-xs mt-1">{passwordForm.formState.errors.confirmPassword.message}</p>
            )}
          </div>

          <div className="bg-gray-50 rounded-xl p-3 text-xs text-gray-500 space-y-1">
            <p className="font-medium text-gray-600">Critères requis :</p>
            <p>• Minimum 8 caractères</p>
            <p>• Une majuscule, une minuscule</p>
            <p>• Un chiffre</p>
            <p>• Un caractère spécial (@$!%*?&)</p>
          </div>

          <button
            type="submit"
            disabled={changePasswordMutation.isPending}
            className="w-full py-2.5 bg-navy text-white text-sm font-semibold rounded-xl hover:bg-navy/90 transition-colors disabled:opacity-60"
          >
            {changePasswordMutation.isPending ? 'Modification...' : 'Modifier le mot de passe'}
          </button>

          {changePasswordMutation.isError && (
            <p className="text-red-600 text-sm text-center">Mot de passe actuel incorrect.</p>
          )}
        </form>
      )}
    </div>
  );
}
