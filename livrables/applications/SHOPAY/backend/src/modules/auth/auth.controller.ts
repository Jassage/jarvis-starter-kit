import { Response } from 'express';
import * as authService from './auth.service';
import { sendSuccess } from '../../utils/response';
import { AuthRequest, AppError } from '../../types';
import { env } from '../../config/env';
import { logAudit } from '../../utils/audit';

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
};

function setSessionCookies(res: Response, accessToken: string, refreshToken: string) {
  res.cookie('shopay_access_token', accessToken, { ...COOKIE_OPTIONS, maxAge: 15 * 60 * 1000 });
  res.cookie('shopay_refresh_token', refreshToken, { ...COOKIE_OPTIONS, maxAge: 30 * 24 * 60 * 60 * 1000 });
}

export async function register(req: AuthRequest, res: Response) {
  const { accessToken, refreshToken, user, boutique } = await authService.register(req.body);
  setSessionCookies(res, accessToken, refreshToken);
  await logAudit({ req, userId: user.id, boutiqueId: boutique?.id, action: 'INSCRIPTION', entite: 'User', entiteId: user.id });
  sendSuccess(res, { user, boutique }, 'Compte et boutique créés avec succès', 201);
}

export async function login(req: AuthRequest, res: Response) {
  const { accessToken, refreshToken, user, boutique } = await authService.login(req.body.email, req.body.password);
  setSessionCookies(res, accessToken, refreshToken);
  await logAudit({ req, userId: user.id, boutiqueId: boutique?.id, action: 'CONNEXION', entite: 'User', entiteId: user.id });
  sendSuccess(res, { user, boutique }, 'Connexion réussie');
}

export async function refresh(req: AuthRequest, res: Response) {
  const token = req.cookies?.shopay_refresh_token;
  if (!token) throw new AppError('Refresh token manquant', 401);

  const { accessToken } = await authService.refresh(token);
  res.cookie('shopay_access_token', accessToken, { ...COOKIE_OPTIONS, maxAge: 15 * 60 * 1000 });
  sendSuccess(res, null, 'Token renouvelé');
}

export async function logout(req: AuthRequest, res: Response) {
  const token = req.cookies?.shopay_refresh_token;
  if (token) {
    const userId = await authService.logout(token);
    if (userId) await logAudit({ req, userId, action: 'DECONNEXION', entite: 'User', entiteId: userId });
  }
  res.clearCookie('shopay_access_token', COOKIE_OPTIONS);
  res.clearCookie('shopay_refresh_token', COOKIE_OPTIONS);
  sendSuccess(res, null, 'Déconnexion réussie');
}

export async function getMe(req: AuthRequest, res: Response) {
  const user = await authService.getMe(req.user!.userId);
  sendSuccess(res, { user });
}

export async function verifyEmail(req: AuthRequest, res: Response) {
  await authService.verifyEmail(req.body.token);
  sendSuccess(res, null, 'Email vérifié avec succès');
}

export async function forgotPassword(req: AuthRequest, res: Response) {
  await authService.forgotPassword(req.body.email);
  sendSuccess(res, null, 'Si un compte existe avec cet email, un lien de réinitialisation a été envoyé.');
}

export async function resetPassword(req: AuthRequest, res: Response) {
  const userId = await authService.resetPassword(req.body.token, req.body.password);
  await logAudit({ req, userId, action: 'MOT_DE_PASSE_REINITIALISE', entite: 'User', entiteId: userId });
  sendSuccess(res, null, 'Mot de passe réinitialisé avec succès');
}
