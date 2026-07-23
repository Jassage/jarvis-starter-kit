import { Router } from 'express';
import { RoleEmploye } from '@prisma/client';
import { asyncHandler } from '../../utils/asyncHandler';
import * as ctrl from './avis.controller';
import { validate } from '../../middlewares/validate.middleware';
import { requireAuth } from '../../middlewares/auth.middleware';
import { requireRole } from '../../middlewares/rbac.middleware';
import { resolveEtablissement } from '../../middlewares/tenant.middleware';
import { avisLimiter } from '../../middlewares/rateLimiter.middleware';
import { soumettreAvisSchema, modererAvisSchema } from './avis.schemas';

const router = Router();

// Public — soumission d'un avis par un client, jamais un formulaire ouvert : la
// propriété du séjour est vérifiée par référence+email (même garde que la
// consultation publique de réservation).
router.post('/', avisLimiter, validate(soumettreAvisSchema), asyncHandler(ctrl.soumettreAvis));

// Staff — propriétaire en lecture seule (cohérent avec le reste du portefeuille),
// modération (masquer/répondre) réservée à la direction établissement/chaîne.
router.get(
  '/',
  requireAuth,
  resolveEtablissement,
  requireRole(RoleEmploye.ADMINISTRATEUR_ETABLISSEMENT, RoleEmploye.ADMINISTRATEUR_CHAINE, RoleEmploye.PROPRIETAIRE),
  asyncHandler(ctrl.listAvisGestion)
);
router.patch(
  '/:id',
  requireAuth,
  resolveEtablissement,
  requireRole(RoleEmploye.ADMINISTRATEUR_ETABLISSEMENT, RoleEmploye.ADMINISTRATEUR_CHAINE),
  validate(modererAvisSchema),
  asyncHandler(ctrl.modererAvis)
);

export default router;
