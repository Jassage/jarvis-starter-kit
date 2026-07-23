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
router.get('/etablissement/serie', requireAuth, resolveEtablissement, requireLectureGestion, validate(periodeSchema), asyncHandler(ctrl.getSerieJournaliere));
router.get('/etablissement/export.xlsx', requireAuth, resolveEtablissement, requireLectureGestion, validate(periodeSchema), asyncHandler(ctrl.exportEtablissement));
router.get('/chaine', requireAuth, requireLectureChaine, validate(periodeSchema), asyncHandler(ctrl.getRapportChaine));
router.get('/chaine/export.xlsx', requireAuth, requireLectureChaine, validate(periodeSchema), asyncHandler(ctrl.exportChaine));

export default router;
