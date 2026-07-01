import { z } from 'zod';

const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

export const registerSchema = z.object({
  body: z.object({
    email: z.string().email('Email invalide'),
    password: z.string().regex(
      PASSWORD_REGEX,
      'Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial'
    ),
    firstName: z.string().min(2, 'Prénom trop court').max(50),
    lastName: z.string().min(2, 'Nom trop court').max(50),
    phone: z.string().optional(),
    role: z.enum(['AGENCY', 'OWNER', 'INDIVIDUAL']).optional().default('INDIVIDUAL'),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Email invalide'),
    password: z.string().min(1, 'Mot de passe requis'),
  }),
});

export const refreshTokenSchema = z.object({
  body: z.object({
    refreshToken: z.string().min(1, 'Refresh token requis'),
  }),
});

export const forgotPasswordSchema = z.object({
  body: z.object({
    email: z.string().email('Email invalide'),
  }),
});

export const resetPasswordSchema = z.object({
  body: z.object({
    token: z.string().min(1),
    password: z.string().regex(PASSWORD_REGEX, 'Mot de passe trop faible'),
  }),
});

export const verifyEmailSchema = z.object({
  params: z.object({
    token: z.string().min(1),
  }),
});

export const updateProfileSchema = z.object({
  body: z.object({
    firstName: z.string().min(2).max(50).optional(),
    lastName: z.string().min(2).max(50).optional(),
    phone: z.string().optional(),
    whatsapp: z.string().optional(),
    bio: z.string().max(500).optional(),
  }),
});

export const changePasswordSchema = z.object({
  body: z.object({
    currentPassword: z.string().min(1),
    newPassword: z.string().regex(PASSWORD_REGEX, 'Nouveau mot de passe trop faible'),
  }),
});
