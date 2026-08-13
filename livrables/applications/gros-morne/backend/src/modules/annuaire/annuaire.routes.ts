import { Router } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import * as ctrl from './annuaire.controller';
import { validate } from '../../middlewares/validate.middleware';
import { requireAuth } from '../../middlewares/auth.middleware';
import { requireAdmin } from '../../middlewares/rbac.middleware';
import { listPubliqueSchema, listToutesSchema, listAdminSchema, createSchema, updateSchema, deleteSchema } from './annuaire.schemas';

const router = Router();

router.get('/', validate(listPubliqueSchema), asyncHandler(ctrl.listPublique));
// Phase 3 : agrégation des 7 verticaux avec recherche/filtre secteur server-side, consommée
// par la page publique /annuaire.
router.get('/toutes', validate(listToutesSchema), asyncHandler(ctrl.listToutes));
router.get('/admin', requireAuth, requireAdmin, validate(listAdminSchema), asyncHandler(ctrl.listAdmin));
router.post('/', requireAuth, requireAdmin, validate(createSchema), asyncHandler(ctrl.create));
router.put('/:id', requireAuth, requireAdmin, validate(updateSchema), asyncHandler(ctrl.update));
router.delete('/:id', requireAuth, requireAdmin, validate(deleteSchema), asyncHandler(ctrl.remove));

export default router;
