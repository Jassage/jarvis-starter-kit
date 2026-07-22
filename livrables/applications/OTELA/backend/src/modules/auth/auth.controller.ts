import { Request, Response } from 'express';
import * as authService from './auth.service';
import { sendSuccess } from '../../utils/response';
import { AppError } from '../../middlewares/errorHandler.middleware';
import { env } from '../../config/env';
import { journaliser } from '../audit/audit.service';

const REFRESH_COOKIE_NAME = 'otela_refresh_token';
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
  // L'échec est journalisé avant d'être relancé : une série de CONNEXION_ECHOUEE sur
  // un même compte ou une même IP est précisément ce qu'un journal d'audit doit
  // rendre visible. L'email tenté est conservé, jamais le mot de passe.
  let result;
  try {
    result = await authService.login(req.body.email, req.body.password);
  } catch (err) {
    await journaliser(
      {
        action: 'CONNEXION_ECHOUEE',
        entite: 'Employe',
        details: { email: req.body.email },
        auteur: { nom: req.body.email },
      },
      req
    );
    throw err;
  }

  const { refreshToken, ...reponse } = result;
  setRefreshCookie(res, refreshToken);

  await journaliser(
    {
      action: 'CONNEXION_REUSSIE',
      entite: 'Employe',
      entiteId: reponse.employe.id,
      etablissementId: reponse.employe.etablissementId,
      auteur: { id: reponse.employe.id, nom: reponse.employe.nom, role: reponse.employe.role },
    },
    req
  );

  sendSuccess(res, reponse, 'Connexion réussie');
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
  const employe = token ? await authService.logout(token) : null;
  clearRefreshCookie(res);

  // L'auteur vient du refresh token, pas de req.employe : cette route n'exige pas
  // d'access token valide. Une déconnexion sans cookie reconnu n'est pas tracée,
  // il n'y a alors aucune session réelle à journaliser.
  if (employe) {
    await journaliser(
      {
        action: 'DECONNEXION',
        entite: 'Employe',
        entiteId: employe.id,
        etablissementId: employe.etablissementId,
        auteur: { id: employe.id, nom: employe.nom, role: employe.role },
      },
      req
    );
  }

  sendSuccess(res, null, 'Déconnexion réussie');
}

export async function getMe(req: Request, res: Response) {
  const employe = await authService.getMe(req.employe!.id);
  sendSuccess(res, { employe });
}

export async function changePassword(req: Request, res: Response) {
  await authService.changePassword(req.employe!.id, req.body.currentPassword, req.body.newPassword);
  sendSuccess(res, null, 'Mot de passe modifié. Reconnectez-vous.');
}
