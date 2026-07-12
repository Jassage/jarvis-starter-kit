import { Router } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import * as ctrl from './chambres.controller';
import { validate } from '../../middlewares/validate.middleware';
import { requireAuth } from '../../middlewares/auth.middleware';
import { requireAdministrateurEtablissement } from '../../middlewares/rbac.middleware';
import { resolveEtablissement } from '../../middlewares/tenant.middleware';
import {
  createTypeChambreSchema, updateTypeChambreSchema,
  createTarifSchema, updateTarifSchema,
  createChambreSchema, updateChambreSchema,
} from './chambres.schemas';

const router = Router();

// Réservée au personnel — le site public passe par /disponibilite (qui combine
// types + tarifs + disponibilité réelle), jamais par cette liste brute.
router.get('/types', requireAuth, resolveEtablissement, asyncHandler(ctrl.listTypes));

router.post('/types', requireAuth, resolveEtablissement, requireAdministrateurEtablissement, validate(createTypeChambreSchema), asyncHandler(ctrl.createType));
router.patch('/types/:id', requireAuth, resolveEtablissement, requireAdministrateurEtablissement, validate(updateTypeChambreSchema), asyncHandler(ctrl.updateType));

router.post('/types/:typeChambreId/tarifs', requireAuth, resolveEtablissement, requireAdministrateurEtablissement, validate(createTarifSchema), asyncHandler(ctrl.createTarif));
router.patch('/tarifs/:id', requireAuth, resolveEtablissement, requireAdministrateurEtablissement, validate(updateTarifSchema), asyncHandler(ctrl.updateTarif));

router.get('/', requireAuth, resolveEtablissement, asyncHandler(ctrl.listChambres));
router.post('/', requireAuth, resolveEtablissement, requireAdministrateurEtablissement, validate(createChambreSchema), asyncHandler(ctrl.createChambre));
router.patch('/:id', requireAuth, resolveEtablissement, requireAdministrateurEtablissement, validate(updateChambreSchema), asyncHandler(ctrl.updateChambre));

export default router;
