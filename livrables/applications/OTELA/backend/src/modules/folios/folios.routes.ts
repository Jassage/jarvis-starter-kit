import { Router } from 'express';
import { RoleEmploye } from '@prisma/client';
import { asyncHandler } from '../../utils/asyncHandler';
import * as ctrl from './folios.controller';
import { requireAuth } from '../../middlewares/auth.middleware';
import { requireRole } from '../../middlewares/rbac.middleware';
import { resolveEtablissement } from '../../middlewares/tenant.middleware';

const router = Router();

router.use(
  requireAuth,
  resolveEtablissement,
  requireRole(RoleEmploye.RECEPTION, RoleEmploye.SERVEUR, RoleEmploye.ADMINISTRATEUR_ETABLISSEMENT)
);

router.get('/chambre/:numero/ouvert', asyncHandler(ctrl.getFolioParChambre));
router.get('/:reservationId', asyncHandler(ctrl.getFolio));

export default router;
