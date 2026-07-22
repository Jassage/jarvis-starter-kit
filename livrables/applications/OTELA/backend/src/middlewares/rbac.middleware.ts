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

// Consultation au niveau chaîne : l'administrateur (super administrateur) et le
// propriétaire. Le propriétaire est en LECTURE SEULE — ne jamais utiliser ce garde
// sur une route qui écrit, sous peine de lui ouvrir des mutations. Pour une écriture
// au niveau chaîne, c'est requireAdministrateurChaine qui s'applique.
export function requireLectureChaine(req: Request, res: Response, next: NextFunction) {
  if (!req.employe) return sendError(res, 'Non authentifié', 401);
  const autorises: RoleEmploye[] = [RoleEmploye.ADMINISTRATEUR_CHAINE, RoleEmploye.PROPRIETAIRE];
  if (!autorises.includes(req.employe.role)) {
    return sendError(res, 'Accès réservé à la direction de la chaîne', 403);
  }
  next();
}

// Consultation des données financières et d'activité d'un établissement : direction
// (établissement et chaîne), propriétaire et comptable. Même avertissement que
// ci-dessus — propriétaire et comptable ne doivent jamais passer par ici pour une
// route qui modifie l'exploitation (check-in, ménage, POS).
export function requireLectureGestion(req: Request, res: Response, next: NextFunction) {
  if (!req.employe) return sendError(res, 'Non authentifié', 401);
  const autorises: RoleEmploye[] = [
    RoleEmploye.ADMINISTRATEUR_CHAINE,
    RoleEmploye.ADMINISTRATEUR_ETABLISSEMENT,
    RoleEmploye.PROPRIETAIRE,
    RoleEmploye.COMPTABLE,
  ];
  if (!autorises.includes(req.employe.role)) {
    return sendError(res, 'Accès réservé à la direction et à la comptabilité', 403);
  }
  next();
}
