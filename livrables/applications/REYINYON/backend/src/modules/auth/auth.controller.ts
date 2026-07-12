import { Request, Response } from 'express';
import * as authService from './auth.service';
import { sendSuccess } from '../../utils/response';
import { AppError } from '../../middlewares/errorHandler.middleware';
import { env } from '../../config/env';

const REFRESH_COOKIE_NAME = 'reyinyon_refresh_token';
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

export async function register(req: Request, res: Response) {
  const { nom, email, password, telephone } = req.body;
  const { refreshToken, ...result } = await authService.register(nom, email, password, telephone);
  setRefreshCookie(res, refreshToken);
  sendSuccess(res, result, 'Compte créé', 201);
}

export async function login(req: Request, res: Response) {
  const { refreshToken, ...result } = await authService.login(req.body.email, req.body.password);
  setRefreshCookie(res, refreshToken);
  sendSuccess(res, result, 'Connexion réussie');
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
