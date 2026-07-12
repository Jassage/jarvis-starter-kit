import { Router } from 'express';
import { RoleEmploye } from '@prisma/client';
import { asyncHandler } from '../../utils/asyncHandler';
import * as ctrl from './factures.controller';
import { validate } from '../../middlewares/validate.middleware';
import { requireAuth } from '../../middlewares/auth.middleware';
import { requireRole } from '../../middlewares/rbac.middleware';
import { resolveEtablissement } from '../../middlewares/tenant.middleware';
import { enregistrerPaiementSchema } from './factures.schemas';

const router = Router();

router.use(requireAuth, resolveEtablissement);

router.get('/:reservationId', asyncHandler(ctrl.getFacture));
router.post(
  '/:factureId/paiements',
  requireRole(RoleEmploye.RECEPTION, RoleEmploye.ADMINISTRATEUR_ETABLISSEMENT),
  validate(enregistrerPaiementSchema),
  asyncHandler(ctrl.enregistrerPaiement)
);

export default router;
