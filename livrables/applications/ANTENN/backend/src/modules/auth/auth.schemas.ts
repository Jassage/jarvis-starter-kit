import { z } from 'zod';
import { motDePasseSchema } from '../../utils/password';

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Email invalide'),
    password: z.string().min(1, 'Mot de passe requis'),
  }),
});

export const updateMeSchema = z.object({
  body: z.object({
    nom: z.string().min(2).max(100).optional(),
  }),
});

export const changePasswordSchema = z.object({
  body: z.object({
    currentPassword: z.string().min(1),
    newPassword: motDePasseSchema,
  }),
});

// Consommation d'un lien de réinitialisation. Le jeton arrive en clair depuis le
// porteur du lien, il est comparé à son empreinte en base (cf. auth.service).
export const resetPasswordSchema = z.object({
  body: z.object({
    token: z.string().min(20, 'Lien de réinitialisation invalide'),
    newPassword: motDePasseSchema,
  }),
});
