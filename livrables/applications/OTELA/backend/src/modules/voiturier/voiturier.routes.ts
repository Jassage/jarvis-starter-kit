import { Router } from 'express';
import { RoleEmploye } from '@prisma/client';
import { asyncHandler } from '../../utils/asyncHandler';
import * as ctrl from './voiturier.controller';
import { validate } from '../../middlewares/validate.middleware';
import { requireAuth } from '../../middlewares/auth.middleware';
import { requireRole } from '../../middlewares/rbac.middleware';
import { resolveEtablissement } from '../../middlewares/tenant.middleware';
import { enregistrerVehiculeSchema, marquerDepartSchema } from './voiturier.schemas';

const router = Router();
const RECEPTION_OU_ADMIN = [RoleEmploye.RECEPTION, RoleEmploye.ADMINISTRATEUR_ETABLISSEMENT] as const;

router.use(requireAuth, resolveEtablissement, requireRole(...RECEPTION_OU_ADMIN));

router.get('/vehicules', asyncHandler(ctrl.listVehicules));
router.post('/vehicules', validate(enregistrerVehiculeSchema), asyncHandler(ctrl.enregistrerVehicule));
router.post('/vehicules/:id/depart', validate(marquerDepartSchema), asyncHandler(ctrl.marquerDepart));

export default router;
