import { Router } from 'express';
import { RoleEmploye } from '@prisma/client';
import { asyncHandler } from '../../utils/asyncHandler';
import * as ctrl from './conciergerie.controller';
import { validate } from '../../middlewares/validate.middleware';
import { requireAuth } from '../../middlewares/auth.middleware';
import { requireRole } from '../../middlewares/rbac.middleware';
import { resolveEtablissement } from '../../middlewares/tenant.middleware';
import { creerDemandeSchema, assignerSchema, terminerSchema } from './conciergerie.schemas';

const router = Router();
const RECEPTION_OU_ADMIN = [RoleEmploye.RECEPTION, RoleEmploye.ADMINISTRATEUR_ETABLISSEMENT] as const;

router.use(requireAuth, resolveEtablissement, requireRole(...RECEPTION_OU_ADMIN));

router.get('/demandes', asyncHandler(ctrl.listDemandes));
router.post('/demandes', validate(creerDemandeSchema), asyncHandler(ctrl.creerDemande));
router.patch('/demandes/:id/assigner', validate(assignerSchema), asyncHandler(ctrl.assigner));
router.post('/demandes/:id/terminer', validate(terminerSchema), asyncHandler(ctrl.terminer));

export default router;
