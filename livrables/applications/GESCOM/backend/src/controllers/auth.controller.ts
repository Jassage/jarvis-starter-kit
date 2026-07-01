import { Request, Response, NextFunction } from 'express';
import { AuthRequest, ok } from '../types';
import * as authService from '../services/auth.service';
import { AppError } from '../types';

const IS_PROD = process.env.NODE_ENV === 'production';

function setAuthCookies(res: Response, token: string, refreshToken: string) {
  const base = { httpOnly: true, secure: IS_PROD, sameSite: 'strict' as const };
  res.cookie('gescom_access_token', token, { ...base, maxAge: 8 * 60 * 60 * 1000 });
  res.cookie('gescom_refresh_token', refreshToken, { ...base, maxAge: 30 * 24 * 60 * 60 * 1000 });
}

function clearAuthCookies(res: Response) {
  const base = { httpOnly: true, secure: IS_PROD, sameSite: 'strict' as const };
  res.clearCookie('gescom_access_token', base);
  res.clearCookie('gescom_refresh_token', base);
}

export async function login(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { email, motDePasse } = req.body;
    const result = await authService.login(email, motDePasse);
    setAuthCookies(res, result.token, result.refreshToken);
    res.json(ok({ utilisateur: result.utilisateur }, 'Connexion réussie'));
  } catch (e) { next(e); }
}

export async function refresh(req: Request, res: Response, next: NextFunction) {
  try {
    const refreshToken = req.cookies?.gescom_refresh_token || req.body?.refreshToken;
    if (!refreshToken) throw new AppError(401, 'Refresh token manquant');
    const result = await authService.refresh(refreshToken);
    setAuthCookies(res, result.token, result.refreshToken);
    res.json(ok(null, 'Token rafraîchi'));
  } catch (e) { next(e); }
}

export async function logout(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const refreshToken = req.cookies?.gescom_refresh_token || req.body?.refreshToken;
    if (refreshToken) await authService.logout(refreshToken);
    clearAuthCookies(res);
    res.json(ok(null, 'Déconnexion réussie'));
  } catch (e) { next(e); }
}

export async function getMe(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const user = await authService.getMe(req.user!.userId);
    res.json(ok(user));
  } catch (e) { next(e); }
}

export async function changePassword(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { ancienMotDePasse, nouveauMotDePasse } = req.body;
    await authService.changePassword(req.user!.userId, ancienMotDePasse, nouveauMotDePasse);
    res.json(ok(null, 'Mot de passe modifié'));
  } catch (e) { next(e); }
}

export async function listUtilisateurs(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const emplacementId = req.query.emplacementId as string | undefined;
    const users = await authService.listUtilisateurs(emplacementId);
    res.json(ok(users));
  } catch (e) { next(e); }
}

export async function createUtilisateur(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const user = await authService.createUtilisateur(req.body, req.user?.userId);
    res.status(201).json(ok(user, 'Utilisateur créé'));
  } catch (e) { next(e); }
}

export async function updateUtilisateur(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const user = await authService.updateUtilisateur(id, req.body, req.user?.userId);
    res.json(ok(user));
  } catch (e) { next(e); }
}
