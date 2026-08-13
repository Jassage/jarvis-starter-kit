import rateLimit from 'express-rate-limit';
import { Request } from 'express';
import { AuthRequest } from '../types';

function userKey(req: Request): string {
  return (req as AuthRequest).user?.userId ?? req.ip ?? 'anonymous';
}

// Brute-force sur le login : 10 tentatives / 15 min par IP
export const loginRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { success: false, message: 'Trop de tentatives de connexion' },
  standardHeaders: true,
  legacyHeaders: false,
});

// API générale : 300 requêtes / minute par utilisateur
export const apiRateLimit = rateLimit({
  windowMs: 60 * 1000,
  max: 300,
  keyGenerator: userKey,
  message: { success: false, message: 'Trop de requêtes. Veuillez patienter.' },
  standardHeaders: true,
  legacyHeaders: false,
});
