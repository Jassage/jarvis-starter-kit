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
// Montée avant aucune route conflictuelle ; le PDF est réservé au personnel habilité
// à consulter la facture (réception, direction, comptable).
router.get(
  '/:reservationId/pdf',
  requireRole(RoleEmploye.RECEPTION, RoleEmploye.ADMINISTRATEUR_ETABLISSEMENT, RoleEmploye.ADMINISTRATEUR_CHAINE, RoleEmploye.COMPTABLE),
  asyncHandler(ctrl.getFacturePdf)
);
router.post(
  '/:factureId/paiements',
  // Le comptable encaisse et suit les paiements, aux côtés de la réception et du
  // directeur.
  requireRole(RoleEmploye.RECEPTION, RoleEmploye.ADMINISTRATEUR_ETABLISSEMENT, RoleEmploye.COMPTABLE),
  validate(enregistrerPaiementSchema),
  asyncHandler(ctrl.enregistrerPaiement)
);

export default router;
