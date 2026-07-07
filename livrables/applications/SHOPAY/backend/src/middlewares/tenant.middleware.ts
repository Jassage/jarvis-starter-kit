import { Response, NextFunction } from 'express';
import { AuthRequest, AppError } from '../types';

// Résout la boutique effective d'une requête marchand authentifiée : req.boutiqueId provient
// TOUJOURS du token (jamais d'un paramètre client-fourni), pour qu'un BOUTIQUE_STAFF/OWNER ne
// puisse jamais requêter/modifier les données d'une autre boutique en trafiquant l'URL/le body.
// C'est le garde-fou central de l'isolation multi-tenant sur toutes les routes /api/{products,categories,orders,...}.
export function resolveBoutique(req: AuthRequest, res: Response, next: NextFunction): void {
  if (!req.user) return next(new AppError('Non authentifié', 401));
  if (req.user.role === 'PLATFORM_SUPER_ADMIN') {
    // L'admin plateforme n'a pas de boutique propre : les routes admin passent boutiqueId explicitement (params).
    return next();
  }
  if (!req.user.boutiqueId) return next(new AppError('Aucune boutique associée à ce compte', 403));
  req.boutiqueId = req.user.boutiqueId;
  next();
}
