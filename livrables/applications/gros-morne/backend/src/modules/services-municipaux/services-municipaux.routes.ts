import { Router } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import * as ctrl from './services-municipaux.controller';
import { validate } from '../../middlewares/validate.middleware';
import { requireAuth } from '../../middlewares/auth.middleware';
import { requireAdmin } from '../../middlewares/rbac.middleware';
import { listPubliqueSchema, listAdminSchema, createSchema, updateSchema, deleteSchema } from './services-municipaux.schemas';

const router = Router();

router.get('/', validate(listPubliqueSchema), asyncHandler(ctrl.listPublique));
router.get('/admin', requireAuth, requireAdmin, validate(listAdminSchema), asyncHandler(ctrl.listAdmin));
router.post('/', requireAuth, requireAdmin, validate(createSchema), asyncHandler(ctrl.create));
router.put('/:id', requireAuth, requireAdmin, validate(updateSchema), asyncHandler(ctrl.update));
router.delete('/:id', requireAuth, requireAdmin, validate(deleteSchema), asyncHandler(ctrl.remove));

export default router;
