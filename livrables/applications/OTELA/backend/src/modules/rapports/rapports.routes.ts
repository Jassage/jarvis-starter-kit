import { Router } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import * as ctrl from './rapports.controller';
import { validate } from '../../middlewares/validate.middleware';
import { requireAuth } from '../../middlewares/auth.middleware';
import { requireLectureGestion, requireLectureChaine } from '../../middlewares/rbac.middleware';
import { resolveEtablissement } from '../../middlewares/tenant.middleware';
import { periodeSchema } from './rapports.schemas';

const router = Router();

// Rapports en lecture : direction (établissement/chaîne), propriétaire et comptable.
// Le propriétaire et l'administrateur de chaîne ciblent un établissement via
// ?etablissementId= (résolu par resolveEtablissement) ; le comptable voit le sien.
router.get('/etablissement', requireAuth, resolveEtablissement, requireLectureGestion, validate(periodeSchema), asyncHandler(ctrl.getRapportEtablissement));
router.get('/chaine', requireAuth, requireLectureChaine, validate(periodeSchema), asyncHandler(ctrl.getRapportChaine));

export default router;
