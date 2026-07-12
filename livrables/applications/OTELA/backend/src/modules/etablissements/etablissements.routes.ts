import { Router } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import * as ctrl from './etablissements.controller';
import { validate } from '../../middlewares/validate.middleware';
import { requireAuth } from '../../middlewares/auth.middleware';
import { requireAdministrateurChaine } from '../../middlewares/rbac.middleware';
import { createEtablissementSchema, updateEtablissementSchema } from './etablissements.schemas';

const router = Router();

// Lecture publique — le site de réservation a besoin de lister les établissements.
router.get('/', asyncHandler(ctrl.list));
router.get('/:id', asyncHandler(ctrl.getOne));

router.post('/', requireAuth, requireAdministrateurChaine, validate(createEtablissementSchema), asyncHandler(ctrl.create));
router.patch('/:id', requireAuth, requireAdministrateurChaine, validate(updateEtablissementSchema), asyncHandler(ctrl.update));

export default router;
