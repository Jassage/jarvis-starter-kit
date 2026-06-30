import { Request, Response, NextFunction } from 'express';
import { AuthRequest, ok } from '../types';
import * as authService from '../services/auth.service';
import { AppError } from '../types';

const IS_PROD = process.env.NODE_ENV === 'production';

function setAuthCookies(res: Response, token: string, refreshToken: string) {
  const base = { httpOnly: true, secure: IS_PROD, sameSite: 'strict' as const };
  res.cookie('banka_access_token',  token,        { ...base, maxAge: 8 * 60 * 60 * 1000 });
  res.cookie('banka_refresh_token', refreshToken, { ...base, maxAge: 30 * 24 * 60 * 60 * 1000 });
}

function clearAuthCookies(res: Response) {
  const base = { httpOnly: true, secure: IS_PROD, sameSite: 'strict' as const };
  res.clearCookie('banka_access_token',  base);
  res.clearCookie('banka_refresh_token', base);
}

export async function login(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { email, motDePasse } = req.body;
    const result = await authService.login(email, motDePasse);
    if (result.requiresTwoFactor) {
      // Le tempToken est court-lived (5 min), il peut rester dans le body
      return res.json(ok({ requiresTwoFactor: true, tempToken: result.tempToken }, 'Code 2FA requis'));
    }
    setAuthCookies(res, result.token, result.refreshToken);
    res.json(ok({ utilisateur: result.utilisateur }, 'Connexion réussie'));
  } catch (e) { next(e); }
}

export async function refresh(req: Request, res: Response, next: NextFunction) {
  try {
    // Le refresh token vient du cookie httpOnly en priorité, fallback body pour compatibilité outils
    const refreshToken = req.cookies?.banka_refresh_token || req.body?.refreshToken;
    if (!refreshToken) throw new AppError(401, 'Refresh token manquant');
    const result = await authService.refresh(refreshToken);
    setAuthCookies(res, result.token, result.refreshToken);
    // Le frontend n'a pas besoin du token — il est dans le cookie httpOnly
    res.json(ok(null, 'Token rafraîchi'));
  } catch (e) { next(e); }
}

export async function logout(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const refreshToken = req.cookies?.banka_refresh_token || req.body?.refreshToken;
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
    const agenceId = req.query.agenceId as string | undefined;
    const users = await authService.listUtilisateurs(agenceId);
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

export async function requestPasswordReset(req: Request, res: Response, next: NextFunction) {
  try {
    await authService.demanderResetMotDePasse(req.body.email);
    // Toujours 200 — ne pas révéler si l'email existe
    res.json(ok(null, 'Si cet email est enregistré, un lien de réinitialisation a été envoyé'));
  } catch (e) { next(e); }
}

export async function confirmPasswordReset(req: Request, res: Response, next: NextFunction) {
  try {
    await authService.reinitialiserMotDePasse(req.body.token, req.body.nouveauMotDePasse);
    res.json(ok(null, 'Mot de passe réinitialisé avec succès'));
  } catch (e) { next(e); }
}

export async function verify2FA(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { tempToken, code } = req.body;
    const result = await authService.verify2FA(tempToken, code);
    setAuthCookies(res, result.token, result.refreshToken);
    res.json(ok({ utilisateur: result.utilisateur }, 'Connexion réussie'));
  } catch (e) { next(e); }
}

export async function setup2FA(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const result = await authService.setup2FA(req.user!.userId);
    res.json(ok(result));
  } catch (e) { next(e); }
}

export async function enable2FA(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { code } = req.body;
    await authService.enable2FA(req.user!.userId, code);
    res.json(ok(null, 'Double authentification activée'));
  } catch (e) { next(e); }
}

export async function disable2FA(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { motDePasse, code } = req.body;
    await authService.disable2FA(req.user!.userId, motDePasse, code);
    res.json(ok(null, 'Double authentification désactivée'));
  } catch (e) { next(e); }
}
