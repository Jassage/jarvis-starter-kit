import { Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt';
import { AuthRequest, AppError } from '../types';

export function requireAuth(req: AuthRequest, res: Response, next: NextFunction): void {
  try {
    // Cookie httpOnly en priorité (résistant au XSS), fallback header Bearer pour compatibilité outils
    const token = req.cookies?.shopay_access_token || req.headers.authorization?.slice(7);
    if (!token) throw new AppError('Token manquant', 401);
    req.user = verifyAccessToken(token);
    next();
  } catch {
    next(new AppError('Token invalide ou expiré', 401));
  }
}

// Version tolérante : n'échoue jamais, pose req.user si un token valide est présent (storefront public
// qui doit néanmoins savoir si un client est connecté, ex. pour pré-remplir le panier).
export function optionalAuth(req: AuthRequest, _res: Response, next: NextFunction): void {
  try {
    const token = req.cookies?.shopay_access_token || req.headers.authorization?.slice(7);
    if (token) req.user = verifyAccessToken(token);
  } catch {
    // ignoré : la requête continue en anonyme
  }
  next();
}
