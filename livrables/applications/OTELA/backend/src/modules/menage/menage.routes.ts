import { Router } from 'express';
import { RoleEmploye } from '@prisma/client';
import { asyncHandler } from '../../utils/asyncHandler';
import * as ctrl from './menage.controller';
import { validate } from '../../middlewares/validate.middleware';
import { requireAuth } from '../../middlewares/auth.middleware';
import { requireRole } from '../../middlewares/rbac.middleware';
import { resolveEtablissement } from '../../middlewares/tenant.middleware';
import { updateTacheSchema, listTachesQuerySchema } from './menage.schemas';

const router = Router();

router.use(requireAuth, resolveEtablissement);

router.get(
  '/taches',
  requireRole(RoleEmploye.MENAGE, RoleEmploye.RECEPTION, RoleEmploye.ADMINISTRATEUR_ETABLISSEMENT),
  validate(listTachesQuerySchema),
  asyncHandler(ctrl.listTaches)
);
router.get(
  '/employes',
  requireRole(RoleEmploye.MENAGE, RoleEmploye.RECEPTION, RoleEmploye.ADMINISTRATEUR_ETABLISSEMENT),
  asyncHandler(ctrl.listEmployesMenage)
);
router.patch(
  '/taches/:id',
  requireRole(RoleEmploye.MENAGE, RoleEmploye.ADMINISTRATEUR_ETABLISSEMENT),
  validate(updateTacheSchema),
  asyncHandler(ctrl.updateTache)
);

export default router;
