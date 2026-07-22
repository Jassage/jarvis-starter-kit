import { Request, Response, NextFunction } from 'express';
import { RoleEmploye } from '@prisma/client';
import { AppError } from './errorHandler.middleware';

// Sépare strictement les établissements, comme SHOPAY::resolveBoutique — l'établissement
// effectif vient TOUJOURS du token (req.employe), jamais d'un paramètre client, pour
// qu'un employé de réception ne puisse jamais trafiquer l'URL vers un autre établissement.
//
// ADMINISTRATEUR_CHAINE et PROPRIETAIRE n'ont pas d'établissement propre : ils peuvent
// consulter la vue consolidée (req.etablissementId = null) ou filtrer explicitement via
// ?etablissementId= pour un drill-down — c'est le seul cas où l'établissement vient d'un
// paramètre client. Le propriétaire y accède en lecture seule, garanti par le RBAC des
// routes (requireLectureChaine) et non ici.
const ROLES_NIVEAU_CHAINE: RoleEmploye[] = [RoleEmploye.ADMINISTRATEUR_CHAINE, RoleEmploye.PROPRIETAIRE];

export function resolveEtablissement(req: Request, _res: Response, next: NextFunction) {
  if (!req.employe) return next(new AppError('Non authentifié', 401));

  if (ROLES_NIVEAU_CHAINE.includes(req.employe.role)) {
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
