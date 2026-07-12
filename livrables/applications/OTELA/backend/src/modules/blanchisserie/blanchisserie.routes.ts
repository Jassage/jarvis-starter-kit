import { Router } from 'express';
import { RoleEmploye } from '@prisma/client';
import { asyncHandler } from '../../utils/asyncHandler';
import * as ctrl from './blanchisserie.controller';
import { validate } from '../../middlewares/validate.middleware';
import { requireAuth } from '../../middlewares/auth.middleware';
import { requireRole } from '../../middlewares/rbac.middleware';
import { resolveEtablissement } from '../../middlewares/tenant.middleware';
import { creerCommandeSchema, updateStatutSchema } from './blanchisserie.schemas';

const router = Router();
const RECEPTION_OU_ADMIN = [RoleEmploye.RECEPTION, RoleEmploye.ADMINISTRATEUR_ETABLISSEMENT] as const;

router.use(requireAuth, resolveEtablissement, requireRole(...RECEPTION_OU_ADMIN));

router.get('/commandes', asyncHandler(ctrl.listCommandes));
router.post('/commandes', validate(creerCommandeSchema), asyncHandler(ctrl.creerCommande));
router.patch('/commandes/:id/statut', validate(updateStatutSchema), asyncHandler(ctrl.updateStatut));

export default router;
