import { Request, Response } from 'express';
import * as authService from './auth.service';
import { sendSuccess } from '../../utils/response';
import { AppError } from '../../middlewares/errorHandler.middleware';
import { logAudit } from '../audit/audit.service';
import { env } from '../../config/env';

const REFRESH_COOKIE_NAME = 'antenn_refresh_token';
const REFRESH_COOKIE_PATH = '/api/auth';
const REFRESH_COOKIE_MAX_AGE = 30 * 24 * 60 * 60 * 1000;

function setRefreshCookie(res: Response, token: string) {
  res.cookie(REFRESH_COOKIE_NAME, token, {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: env.NODE_ENV === 'production' ? 'none' : 'lax',
    path: REFRESH_COOKIE_PATH,
    maxAge: REFRESH_COOKIE_MAX_AGE,
  });
}

function clearRefreshCookie(res: Response) {
  res.clearCookie(REFRESH_COOKIE_NAME, { path: REFRESH_COOKIE_PATH });
}

export async function login(req: Request, res: Response) {
  const { refreshToken, ...result } = await authService.login(req.body.email, req.body.password);
  setRefreshCookie(res, refreshToken);
  // Auteur passé explicitement : le middleware d'authentification n'est pas encore
  // passé sur cette requête, `req.user` n'existe donc pas.
  await logAudit(req, 'CONNEXION', { auteur: result.user, details: 'Connexion à la régie' });
  sendSuccess(res, result, 'Connexion réussie');
}

// Consommation d'un lien de réinitialisation généré par un administrateur. Public par
// nature (l'utilisateur est justement celui qui ne peut pas se connecter), donc soumis
// au limiteur d'authentification.
export async function resetPassword(req: Request, res: Response) {
  const utilisateur = await authService.resetPassword(req.body.token, req.body.newPassword);
  await logAudit(req, 'UTILISATEUR_MOT_DE_PASSE_REINITIALISE', {
    auteur: { id: utilisateur.id, email: utilisateur.email, nom: utilisateur.nom },
    cible: 'User',
    cibleId: utilisateur.id,
    details: 'Mot de passe redéfini via un lien de réinitialisation',
  });
  sendSuccess(res, null, 'Mot de passe redéfini. Vous pouvez vous connecter.');
}

export async function refresh(req: Request, res: Response) {
  const token = req.cookies?.[REFRESH_COOKIE_NAME];
  if (!token) throw new AppError('Refresh token manquant', 401);
  const { refreshToken, ...result } = await authService.refresh(token);
  setRefreshCookie(res, refreshToken);
  sendSuccess(res, result, 'Tokens renouvelés');
}

export async function logout(req: Request, res: Response) {
  const token = req.cookies?.[REFRESH_COOKIE_NAME];
  if (token) await authService.logout(token);
  clearRefreshCookie(res);
  sendSuccess(res, null, 'Déconnexion réussie');
}

export async function getMe(req: Request, res: Response) {
  const user = await authService.getMe(req.user!.id);
  sendSuccess(res, { user });
}

export async function updateMe(req: Request, res: Response) {
  const user = await authService.updateMe(req.user!.id, req.body);
  sendSuccess(res, { user }, 'Profil mis à jour');
}

export async function changePassword(req: Request, res: Response) {
  await authService.changePassword(req.user!.id, req.body.currentPassword, req.body.newPassword);
  sendSuccess(res, null, 'Mot de passe modifié. Reconnectez-vous.');
}
