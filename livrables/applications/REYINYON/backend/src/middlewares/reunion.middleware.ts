import { Request, Response, NextFunction } from 'express';
import prisma from '../config/database';
import { AppError } from './errorHandler.middleware';

// Charge la réunion depuis le paramètre d'URL et l'attache à req.reunion —
// jamais faire confiance à un champ hoteId envoyé par le client, toujours
// recharger depuis la base avant toute vérification de permission.
export function resolveReunion(paramName: 'codeReunion' | 'reunionId' = 'codeReunion') {
  return async (req: Request, _res: Response, next: NextFunction) => {
    const value = req.params[paramName];
    const reunion =
      paramName === 'codeReunion'
        ? await prisma.reunion.findUnique({ where: { codeReunion: value } })
        : await prisma.reunion.findUnique({ where: { id: value } });

    if (!reunion) return next(new AppError('Réunion non trouvée', 404));
    req.reunion = reunion;
    next();
  };
}

// Déviation assumée du RBAC habituel du portefeuille (rôle global sur le
// compte) : ici les permissions sont scopées PAR réunion — req.reunion.hoteId
// (chargé depuis la base par resolveReunion) comparé à req.user (chargé depuis
// le token), jamais un rôle fixe, puisqu'un même utilisateur est hôte d'une
// réunion et simple participant d'une autre.
export function requireHote(req: Request, res: Response, next: NextFunction) {
  if (!req.user) return next(new AppError('Non authentifié', 401));
  if (!req.reunion) return next(new AppError('Réunion non résolue', 500));
  if (req.reunion.hoteId !== req.user.id) {
    return next(new AppError("Seul l'hôte peut effectuer cette action", 403));
  }
  next();
}
