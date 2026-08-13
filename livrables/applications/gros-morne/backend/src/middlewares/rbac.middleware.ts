import { Response, NextFunction } from 'express';
import { AdminRole } from '@prisma/client';
import { AuthRequest, AppError } from '../types';

export function requireRole(...roles: AdminRole[]) {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) return next(new AppError(401, 'Non authentifié'));
    if (!roles.includes(req.user.role)) {
      return next(new AppError(403, 'Accès refusé : droits insuffisants'));
    }
    next();
  };
}

export const requireAdmin = requireRole('ADMIN');
