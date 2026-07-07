import { Response, NextFunction } from 'express';
import { PlatformRole } from '@prisma/client';
import { AuthRequest, AppError } from '../types';

export function requireRole(...roles: PlatformRole[]) {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) return next(new AppError('Non authentifié', 401));
    if (!roles.includes(req.user.role)) {
      return next(new AppError('Accès refusé : droits insuffisants', 403));
    }
    next();
  };
}

export const requirePlatformAdmin = requireRole('PLATFORM_SUPER_ADMIN');
export const requireMerchant = requireRole('BOUTIQUE_OWNER', 'BOUTIQUE_STAFF');
export const requireBoutiqueOwner = requireRole('BOUTIQUE_OWNER');
