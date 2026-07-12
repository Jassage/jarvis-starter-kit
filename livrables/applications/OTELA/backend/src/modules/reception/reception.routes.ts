import { Router } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import * as ctrl from './reception.controller';
import { requireAuth } from '../../middlewares/auth.middleware';
import { requireRole } from '../../middlewares/rbac.middleware';
import { resolveEtablissement } from '../../middlewares/tenant.middleware';
import { RoleEmploye } from '@prisma/client';

const router = Router();

router.use(requireAuth, resolveEtablissement, requireRole(RoleEmploye.RECEPTION, RoleEmploye.ADMINISTRATEUR_ETABLISSEMENT));

router.get('/vue-du-jour', asyncHandler(ctrl.vueDuJour));
router.post('/:reservationId/checkin', asyncHandler(ctrl.checkin));
router.post('/:reservationId/checkout', asyncHandler(ctrl.checkout));

export default router;
