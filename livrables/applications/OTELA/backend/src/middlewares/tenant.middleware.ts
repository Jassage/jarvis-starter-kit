import { Request, Response, NextFunction } from 'express';
import { RoleEmploye } from '@prisma/client';
import { AppError } from './errorHandler.middleware';

// Sépare strictement les établissements, comme SHOPAY::resolveBoutique — l'établissement
// effectif vient TOUJOURS du token (req.employe), jamais d'un paramètre client, pour
// qu'un employé de réception ne puisse jamais trafiquer l'URL vers un autre établissement.
//
// Seul ADMINISTRATEUR_CHAINE n'a pas d'établissement propre : il peut consulter la vue
// consolidée (req.etablissementId = null) ou filtrer explicitement via ?etablissementId=
// pour un drill-down — c'est le seul cas où l'établissement vient d'un paramètre client.
export function resolveEtablissement(req: Request, _res: Response, next: NextFunction) {
  if (!req.employe) return next(new AppError('Non authentifié', 401));

  if (req.employe.role === RoleEmploye.ADMINISTRATEUR_CHAINE) {
    const filtre = typeof req.query.etablissementId === 'string' ? req.query.etablissementId : null;
    req.etablissementId = filtre;
    return next();
  }

  if (!req.employe.etablissementId) {
    return next(new AppError('Aucun établissement associé à ce compte', 403));
  }
  req.etablissementId = req.employe.etablissementId;
  next();
}
