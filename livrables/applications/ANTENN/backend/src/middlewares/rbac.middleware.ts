import { Request, Response, NextFunction } from 'express';
import { Role } from '@prisma/client';
import { sendError } from '../utils/response';

export function requireRole(...roles: Role[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) return sendError(res, 'Non authentifié', 401);
    if (!roles.includes(req.user.role)) {
      return sendError(res, 'Permission insuffisante', 403);
    }
    next();
  };
}

// Sponsors (contrats) et gestion des utilisateurs réservés à l'administrateur —
// l'opérateur régie gère la grille/matchs mais pas les contrats commerciaux.
export function requireAdministrateur(req: Request, res: Response, next: NextFunction) {
  if (!req.user) return sendError(res, 'Non authentifié', 401);
  if (req.user.role !== Role.ADMINISTRATEUR) {
    return sendError(res, 'Accès réservé aux administrateurs', 403);
  }
  next();
}
