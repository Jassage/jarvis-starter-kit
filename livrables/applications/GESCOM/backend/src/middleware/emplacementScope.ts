import { Response, NextFunction } from 'express';
import { AuthRequest, AppError } from '../types';

const ROLES_CLOISONNES = new Set(['VENDEUR', 'MAGASINIER']);

function estCloisonne(role?: string): boolean {
  return !!role && ROLES_CLOISONNES.has(role);
}

/**
 * Un VENDEUR/MAGASINIER ne doit agir que sur l'emplacement auquel il est rattaché
 * (Boutique OU Entrepôt, jamais les deux) : GERANT/COMPTABLE/SUPER_ADMIN restent
 * multi-sites. Utilisé sur les routes de création/mutation où le body porte le champ.
 */
export function requireOwnEmplacementBody(field: string) {
  return (req: AuthRequest, _res: Response, next: NextFunction): void => {
    if (!estCloisonne(req.user?.role)) return next();
    if (!req.user?.emplacementId) {
      return next(new AppError(403, 'Aucun emplacement assigné à ce compte'));
    }
    const fourni = req.body?.[field];
    if (fourni && fourni !== req.user.emplacementId) {
      return next(new AppError(403, 'Vous ne pouvez agir que sur votre emplacement assigné'));
    }
    req.body[field] = req.user.emplacementId;
    next();
  };
}

/**
 * Version liste/consultation : force silencieusement le filtre à l'emplacement du compte
 * (pas d'erreur si le champ est absent — un VENDEUR qui liste sans filtre doit voir
 * uniquement son site, jamais les deux).
 */
export function scopeEmplacementQuery(field = 'emplacementId') {
  return (req: AuthRequest, _res: Response, next: NextFunction): void => {
    if (!estCloisonne(req.user?.role)) return next();
    if (!req.user?.emplacementId) {
      return next(new AppError(403, 'Aucun emplacement assigné à ce compte'));
    }
    (req.query as any)[field] = req.user.emplacementId;
    next();
  };
}

/**
 * Pour les actions par id (recevoir/annuler une commande ou un transfert) : le champ
 * emplacement pertinent n'est pas dans le body mais sur l'enregistrement déjà en base.
 * Les services appellent cette fonction après avoir chargé l'enregistrement.
 */
export function assertOwnEmplacement(
  user: { role: string; emplacementId?: string | null } | undefined,
  emplacementIdCible: string,
  message = 'Vous ne pouvez agir que sur votre emplacement assigné'
): void {
  if (!estCloisonne(user?.role)) return;
  if (!user?.emplacementId) throw new AppError(403, 'Aucun emplacement assigné à ce compte');
  if (user.emplacementId !== emplacementIdCible) throw new AppError(403, message);
}
