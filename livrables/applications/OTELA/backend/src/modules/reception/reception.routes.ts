import { Router } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import * as ctrl from './reception.controller';
import { requireAuth } from '../../middlewares/auth.middleware';
import { requireRole } from '../../middlewares/rbac.middleware';
import { resolveEtablissement } from '../../middlewares/tenant.middleware';
import { uploadSignatureCheckIn } from '../../middlewares/upload.middleware';
import { RoleEmploye } from '@prisma/client';

const router = Router();

router.use(requireAuth, resolveEtablissement, requireRole(RoleEmploye.RECEPTION, RoleEmploye.ADMINISTRATEUR_ETABLISSEMENT));

router.get('/vue-du-jour', asyncHandler(ctrl.vueDuJour));
// La signature du client (pad canvas -> PNG) est envoyée en multipart, comme tout
// autre upload du portefeuille — passe par multer avant le contrôleur.
router.post('/:reservationId/checkin', uploadSignatureCheckIn, asyncHandler(ctrl.checkin));
router.post('/:reservationId/checkout', asyncHandler(ctrl.checkout));

export default router;
