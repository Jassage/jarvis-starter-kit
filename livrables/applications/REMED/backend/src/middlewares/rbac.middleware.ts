import { Response, NextFunction } from 'express';
import { Role } from '@prisma/client';
import { AuthRequest, AppError } from '../types';

export function requireRole(...roles: Role[]) {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) return next(new AppError(401, 'Non authentifié'));
    if (!roles.includes(req.user.role)) {
      return next(new AppError(403, 'Accès refusé : droits insuffisants'));
    }
    next();
  };
}

export const requireAdmin = requireRole('SUPER_ADMIN', 'GERANT');
export const requireGestionCatalogue = requireRole('SUPER_ADMIN', 'GERANT', 'PHARMACIEN');
export const requireStock = requireRole('SUPER_ADMIN', 'GERANT', 'PHARMACIEN', 'MAGASINIER');
export const requireVente = requireRole('SUPER_ADMIN', 'GERANT', 'PHARMACIEN', 'VENDEUR');
