import { Response, NextFunction } from 'express';
import { AuthRequest, ok } from '../types';
import * as authService from '../services/auth.service';

export async function login(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { email, motDePasse } = req.body;
    const result = await authService.login(email, motDePasse);
    res.json(ok(result, 'Connexion réussie'));
  } catch (e) { next(e); }
}

export async function refresh(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { refreshToken } = req.body;
    const result = await authService.refresh(refreshToken);
    res.json(ok(result));
  } catch (e) { next(e); }
}

export async function logout(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { refreshToken } = req.body;
    await authService.logout(refreshToken);
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
