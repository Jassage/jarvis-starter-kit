import { Router } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import * as ctrl from './contenu.controller';
import { validate } from '../../middlewares/validate.middleware';
import { requireAuth } from '../../middlewares/auth.middleware';
import { requireAdmin } from '../../middlewares/rbac.middleware';
import { listContenuSchema, createContenuSchema, updateContenuSchema, deleteContenuSchema } from './contenu.schemas';

const router = Router();

// Public : le site vitrine consomme ces blocs dès la Phase 1, sans authentification.
router.get('/', validate(listContenuSchema), asyncHandler(ctrl.list));

router.post('/', requireAuth, requireAdmin, validate(createContenuSchema), asyncHandler(ctrl.create));
router.put('/:id', requireAuth, requireAdmin, validate(updateContenuSchema), asyncHandler(ctrl.update));
router.delete('/:id', requireAuth, requireAdmin, validate(deleteContenuSchema), asyncHandler(ctrl.remove));

export default router;
