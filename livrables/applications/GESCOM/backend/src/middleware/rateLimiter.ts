import rateLimit from 'express-rate-limit';
import { Request } from 'express';
import { AuthRequest } from '../types';

function userKey(req: Request): string {
  return (req as AuthRequest).user?.userId ?? req.ip ?? 'anonymous';
}

/** API générale : 300 requêtes / minute par utilisateur */
export const apiRateLimit = rateLimit({
  windowMs: 60 * 1000,
  max: 300,
  keyGenerator: userKey,
  message: { success: false, error: 'Trop de requêtes. Veuillez patienter.' },
  standardHeaders: true,
  legacyHeaders: false,
});
