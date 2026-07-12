import { Router } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import * as ctrl from './rapports.controller';
import { validate } from '../../middlewares/validate.middleware';
import { requireAuth } from '../../middlewares/auth.middleware';
import { requireAdministrateurEtablissement, requireAdministrateurChaine } from '../../middlewares/rbac.middleware';
import { resolveEtablissement } from '../../middlewares/tenant.middleware';
import { periodeSchema } from './rapports.schemas';

const router = Router();

router.get('/etablissement', requireAuth, resolveEtablissement, requireAdministrateurEtablissement, validate(periodeSchema), asyncHandler(ctrl.getRapportEtablissement));
router.get('/chaine', requireAuth, requireAdministrateurChaine, validate(periodeSchema), asyncHandler(ctrl.getRapportChaine));

export default router;
