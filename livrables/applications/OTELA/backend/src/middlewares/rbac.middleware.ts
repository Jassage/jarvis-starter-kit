import { Request, Response, NextFunction } from 'express';
import { RoleEmploye } from '@prisma/client';
import { sendError } from '../utils/response';

export function requireRole(...roles: RoleEmploye[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.employe) return sendError(res, 'Non authentifié', 401);
    if (!roles.includes(req.employe.role)) {
      return sendError(res, 'Permission insuffisante', 403);
    }
    next();
  };
}

export function requireAdministrateurEtablissement(req: Request, res: Response, next: NextFunction) {
  if (!req.employe) return sendError(res, 'Non authentifié', 401);
  if (req.employe.role !== RoleEmploye.ADMINISTRATEUR_ETABLISSEMENT && req.employe.role !== RoleEmploye.ADMINISTRATEUR_CHAINE) {
    return sendError(res, 'Accès réservé aux administrateurs d\'établissement', 403);
  }
  next();
}

export function requireAdministrateurChaine(req: Request, res: Response, next: NextFunction) {
  if (!req.employe) return sendError(res, 'Non authentifié', 401);
  if (req.employe.role !== RoleEmploye.ADMINISTRATEUR_CHAINE) {
    return sendError(res, 'Accès réservé à l\'administration de la chaîne', 403);
  }
  next();
}
