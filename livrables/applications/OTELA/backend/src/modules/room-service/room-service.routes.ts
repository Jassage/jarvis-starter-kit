import { Router } from 'express';
import { RoleEmploye } from '@prisma/client';
import { asyncHandler } from '../../utils/asyncHandler';
import * as ctrl from './room-service.controller';
import { validate } from '../../middlewares/validate.middleware';
import { requireAuth } from '../../middlewares/auth.middleware';
import { requireRole } from '../../middlewares/rbac.middleware';
import { resolveEtablissement } from '../../middlewares/tenant.middleware';
import { ouvrirCommandeSchema, ajouterLigneSchema } from './room-service.schemas';

const router = Router();
const SERVEUR_OU_ADMIN = [RoleEmploye.SERVEUR, RoleEmploye.ADMINISTRATEUR_ETABLISSEMENT] as const;

router.use(requireAuth, resolveEtablissement, requireRole(...SERVEUR_OU_ADMIN));

// "/commandes/cuisine" AVANT "/commandes/:id" (sinon Express matcherait "cuisine"
// comme un id de commande), même précaution que restaurant.routes.ts.
router.post('/commandes', validate(ouvrirCommandeSchema), asyncHandler(ctrl.ouvrirCommande));
router.get('/commandes/cuisine', asyncHandler(ctrl.listCommandesCuisine));
router.get('/commandes/:id', asyncHandler(ctrl.getCommande));
router.post('/commandes/:id/lignes', validate(ajouterLigneSchema), asyncHandler(ctrl.ajouterLigne));
router.patch('/commandes/:id/envoyer-cuisine', asyncHandler(ctrl.envoyerEnCuisine));
router.patch('/commandes/:id/livrer', asyncHandler(ctrl.marquerLivree));
router.post('/commandes/:id/cloturer', asyncHandler(ctrl.cloturerCommande));

export default router;
