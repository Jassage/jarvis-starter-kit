import { Response, NextFunction } from 'express';
import { RoleUtilisateur } from '@prisma/client';
import { AuthRequest, AppError } from '../types';

export function requireRole(...roles: RoleUtilisateur[]) {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) return next(new AppError(401, 'Non authentifié'));
    if (!roles.includes(req.user.role)) {
      return next(new AppError(403, 'Accès refusé : droits insuffisants'));
    }
    next();
  };
}

export const requireSuperAdmin = requireRole('SUPER_ADMIN');
