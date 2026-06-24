import { Response, NextFunction } from 'express';
import { UserRole } from '@prisma/client';
import { AuthRequest, AppError } from '../types';

export function requireRole(...roles: UserRole[]) {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) return next(new AppError(401, 'Non authentifié'));
    if (!roles.includes(req.user.role)) {
      return next(new AppError(403, 'Accès refusé : droits insuffisants'));
    }
    next();
  };
}

export const requireAdmin = requireRole('SUPER_ADMIN', 'DIRECTEUR');
export const requireSupervisor = requireRole('SUPER_ADMIN', 'DIRECTEUR', 'SUPERVISEUR');
export const requireCaissier = requireRole('SUPER_ADMIN', 'DIRECTEUR', 'SUPERVISEUR', 'CAISSIER');
export const requireAgentCredit = requireRole('SUPER_ADMIN', 'DIRECTEUR', 'SUPERVISEUR', 'AGENT_CREDIT');
export const requireComptable = requireRole('SUPER_ADMIN', 'DIRECTEUR', 'SUPERVISEUR', 'COMPTABLE');
