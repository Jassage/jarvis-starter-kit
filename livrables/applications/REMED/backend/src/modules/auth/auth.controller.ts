import { Response } from 'express';
import * as authService from './auth.service';
import { sendSuccess } from '../../utils/response';
import { AuthRequest, AppError } from '../../types';
import { env } from '../../config/env';
import { logAudit } from '../../utils/audit';
import { asyncHandler } from '../../utils/asyncHandler';

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
};

export const login = asyncHandler(async (req: AuthRequest, res: Response) => {
  try {
    const { accessToken, refreshToken, utilisateur } = await authService.login(req.body.email, req.body.motDePasse);

    res.cookie('remed_access_token', accessToken, { ...COOKIE_OPTIONS, maxAge: 15 * 60 * 1000 });
    res.cookie('remed_refresh_token', refreshToken, { ...COOKIE_OPTIONS, maxAge: 30 * 24 * 60 * 60 * 1000 });

    await logAudit({ req, userId: utilisateur.id, action: 'CONNEXION', entite: 'Utilisateur', entiteId: utilisateur.id });

    sendSuccess(res, { utilisateur }, 'Connexion réussie');
  } catch (err) {
    // Le verrouillage de compte (423) est un événement de sécurité à part entière — tracé même
    // si la connexion échoue, contrairement à un simple mot de passe incorrect (401, déjà
    // suffisamment reconstituable depuis `tentativesEchouees` en base, pas besoin de le dupliquer
    // dans le journal à chaque essai raté).
    if (err instanceof AppError && err.statusCode === 423) {
      await logAudit({ req, action: 'VERROUILLAGE_COMPTE', entite: 'Utilisateur', details: { email: req.body.email } });
    }
    throw err;
  }
});

export const refresh = asyncHandler(async (req: AuthRequest, res: Response) => {
  const token = req.cookies?.remed_refresh_token;
  if (!token) throw new AppError(401, 'Refresh token manquant');

  const { accessToken, refreshToken } = await authService.refresh(token);
  res.cookie('remed_access_token', accessToken, { ...COOKIE_OPTIONS, maxAge: 15 * 60 * 1000 });
  res.cookie('remed_refresh_token', refreshToken, { ...COOKIE_OPTIONS, maxAge: 30 * 24 * 60 * 60 * 1000 });
  sendSuccess(res, null, 'Token renouvelé');
});

export const logout = asyncHandler(async (req: AuthRequest, res: Response) => {
  const token = req.cookies?.remed_refresh_token;
  if (token) {
    const userId = await authService.logout(token);
    if (userId) {
      await logAudit({ req, userId, action: 'DECONNEXION', entite: 'Utilisateur', entiteId: userId });
    }
  }

  res.clearCookie('remed_access_token', COOKIE_OPTIONS);
  res.clearCookie('remed_refresh_token', COOKIE_OPTIONS);
  sendSuccess(res, null, 'Déconnexion réussie');
});

export const getMe = asyncHandler(async (req: AuthRequest, res: Response) => {
  const utilisateur = await authService.getMe(req.user!.userId);
  sendSuccess(res, { utilisateur });
});
