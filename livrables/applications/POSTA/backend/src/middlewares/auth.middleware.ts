import { Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt';
import { AuthRequest, AppError } from '../types';

export function requireAuth(req: AuthRequest, res: Response, next: NextFunction): void {
  try {
    // Cookie httpOnly en priorité (résistant au XSS), fallback header Bearer pour compatibilité outils
    const token = req.cookies?.posta_access_token || req.headers.authorization?.slice(7);
    if (!token) throw new AppError(401, 'Token manquant');
    req.user = verifyAccessToken(token);
    next();
  } catch {
    next(new AppError(401, 'Token invalide ou expiré'));
  }
}
