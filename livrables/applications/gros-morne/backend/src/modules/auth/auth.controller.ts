import { Response } from 'express';
import * as authService from './auth.service';
import { sendSuccess } from '../../utils/response';
import { AuthRequest, AppError } from '../../types';
import { env } from '../../config/env';

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
};

export async function login(req: AuthRequest, res: Response) {
  const { accessToken, refreshToken, adminUser } = await authService.login(
    req.body.email,
    req.body.motDePasse
  );

  res.cookie('gm_access_token', accessToken, { ...COOKIE_OPTIONS, maxAge: 15 * 60 * 1000 });
  res.cookie('gm_refresh_token', refreshToken, {
    ...COOKIE_OPTIONS,
    maxAge: 30 * 24 * 60 * 60 * 1000,
  });

  sendSuccess(res, { adminUser }, 'Connexion réussie');
}

export async function refresh(req: AuthRequest, res: Response) {
  const token = req.cookies?.gm_refresh_token;
  if (!token) throw new AppError(401, 'Refresh token manquant');

  const { accessToken, adminUser } = await authService.refresh(token);
  res.cookie('gm_access_token', accessToken, { ...COOKIE_OPTIONS, maxAge: 15 * 60 * 1000 });
  sendSuccess(res, { accessToken, adminUser }, 'Token renouvelé');
}

export async function logout(req: AuthRequest, res: Response) {
  const token = req.cookies?.gm_refresh_token;
  if (token) await authService.logout(token);

  res.clearCookie('gm_access_token', COOKIE_OPTIONS);
  res.clearCookie('gm_refresh_token', COOKIE_OPTIONS);
  sendSuccess(res, null, 'Déconnexion réussie');
}

export async function getMe(req: AuthRequest, res: Response) {
  const adminUser = await authService.getMe(req.user!.userId);
  sendSuccess(res, { adminUser });
}
