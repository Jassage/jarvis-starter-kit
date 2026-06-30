import { Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';
import { AuthRequest, AppError } from '../types';

export function requireAuth(req: AuthRequest, res: Response, next: NextFunction): void {
  try {
    // Cookie httpOnly en priorité (résistant au XSS), fallback header Bearer pour compatibilité outils (Postman, mobile)
    const token = req.cookies?.banka_access_token || req.headers.authorization?.slice(7);
    if (!token) throw new AppError(401, 'Token manquant');
    const payload = verifyToken(token);
    req.user = payload;
    next();
  } catch {
    next(new AppError(401, 'Token invalide ou expiré'));
  }
}

// Pour SSE uniquement : EventSource ne supporte pas les headers custom
// Priorité : cookie httpOnly, puis query param (token court-lived uniquement en dev/test)
export function requireAuthSSE(req: AuthRequest, res: Response, next: NextFunction): void {
  try {
    const token = req.cookies?.banka_access_token || (req.query.token as string);
    if (!token) throw new AppError(401, 'Token manquant');
    const payload = verifyToken(token);
    req.user = payload;
    next();
  } catch {
    res.status(401).end();
  }
}
