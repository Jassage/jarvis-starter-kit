import { Response, NextFunction } from 'express';
import prisma from '../config/database';
import { AuthRequest } from '../types';

const METHODES_MUTANTES = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);
const ACTIONS: Record<string, string> = { POST: 'CREATE', PUT: 'UPDATE', PATCH: 'UPDATE', DELETE: 'DELETE' };

// Journal d'activité générique (Phase 2f) : plutôt qu'un retrofit manuel dans chacun des
// ~20 modules existants, une seule capture au niveau applicatif sur toute requête admin
// mutante réussie. Utilise `req.originalUrl` (stable, jamais réécrit par les routeurs
// imbriqués) pour dériver l'entité, contrairement à `req.baseUrl` dont la valeur dépend de
// l'empilement des routeurs traversés. Écoute `res.on('finish')` : ce callback s'exécute
// après que `requireAuth` (plus loin dans la chaîne de middlewares de la route) ait déjà
// peuplé `req.user` sur ce même objet requête, donc la lecture est fiable même si ce
// middleware est monté avant les routes elles-mêmes.
export function activityLogger(req: AuthRequest, res: Response, next: NextFunction): void {
  if (!METHODES_MUTANTES.has(req.method)) return next();

  res.on('finish', () => {
    if (!req.user) return; // requête non authentifiée (login, formulaires publics...)
    if (res.statusCode < 200 || res.statusCode >= 300) return; // échec : rien à journaliser

    const pathname = req.originalUrl.split('?')[0];
    const segments = pathname.split('/').filter(Boolean); // ['api', 'faqs', ':id'?, ...]
    const entite = segments[1] ?? 'inconnu';
    const entiteId = typeof req.params?.id === 'string' ? req.params.id : undefined;

    prisma.activityLog
      .create({
        data: {
          adminUserId: req.user.userId,
          adminNom: req.user.email,
          action: ACTIONS[req.method] ?? req.method,
          entite,
          entiteId,
          chemin: pathname,
        },
      })
      .catch(() => {
        // Effet secondaire non bloquant : une panne d'écriture du journal ne doit jamais faire
        // échouer une requête métier déjà répondue avec succès.
      });
  });

  next();
}
