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

export async function login(req: AuthRequest, res: Response) {
  const { accessToken, refreshToken, utilisateur } = await authService.login(
    req.body.email,
    req.body.motDePasse
  );

  res.cookie('posta_access_token', accessToken, { ...COOKIE_OPTIONS, maxAge: 15 * 60 * 1000 });
  res.cookie('posta_refresh_token', refreshToken, {
    ...COOKIE_OPTIONS,
    maxAge: 30 * 24 * 60 * 60 * 1000,
  });

  await logAudit({
    req,
    userId: utilisateur.id,
    action: 'CONNEXION',
    entite: 'Utilisateur',
    entiteId: utilisateur.id,
  });

  sendSuccess(res, { utilisateur }, 'Connexion réussie');
}

export async function refresh(req: AuthRequest, res: Response) {
  const token = req.cookies?.posta_refresh_token;
  if (!token) throw new AppError(401, 'Refresh token manquant');

  const { accessToken } = await authService.refresh(token);
  res.cookie('posta_access_token', accessToken, { ...COOKIE_OPTIONS, maxAge: 15 * 60 * 1000 });
  sendSuccess(res, null, 'Token renouvelé');
}

export async function logout(req: AuthRequest, res: Response) {
  const token = req.cookies?.posta_refresh_token;
  if (token) {
    const userId = await authService.logout(token);
    if (userId) {
      await logAudit({ req, userId, action: 'DECONNEXION', entite: 'Utilisateur', entiteId: userId });
    }
  }

  res.clearCookie('posta_access_token', COOKIE_OPTIONS);
  res.clearCookie('posta_refresh_token', COOKIE_OPTIONS);
  sendSuccess(res, null, 'Déconnexion réussie');
}

export async function getMe(req: AuthRequest, res: Response) {
  const utilisateur = await authService.getMe(req.user!.userId);
  sendSuccess(res, { utilisateur });
}

export async function forgotPassword(req: AuthRequest, res: Response) {
  await authService.requestPasswordReset(req.body.email);
  sendSuccess(res, null, 'Si un compte existe avec cet email, un lien de réinitialisation a été envoyé');
}

export async function resetPassword(req: AuthRequest, res: Response) {
  const userId = await authService.resetPassword(req.body.token, req.body.motDePasse);
  await logAudit({ req, userId, action: 'MOT_DE_PASSE_REINITIALISE', entite: 'Utilisateur', entiteId: userId });
  sendSuccess(res, null, 'Mot de passe mis à jour, vous pouvez vous connecter');
}
