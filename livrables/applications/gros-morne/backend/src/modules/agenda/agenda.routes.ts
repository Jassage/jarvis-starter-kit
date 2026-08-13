import { Router } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import * as ctrl from './agenda.controller';
import { validate } from '../../middlewares/validate.middleware';
import { requireAuth } from '../../middlewares/auth.middleware';
import { requireAdmin } from '../../middlewares/rbac.middleware';
import {
  listEvenementsPubliqueSchema,
  listEvenementsAdminSchema,
  createEvenementSchema,
  updateEvenementSchema,
  deleteEvenementSchema,
} from './agenda.schemas';

const router = Router();

router.get('/', validate(listEvenementsPubliqueSchema), asyncHandler(ctrl.listPublique));
router.get('/admin', requireAuth, requireAdmin, validate(listEvenementsAdminSchema), asyncHandler(ctrl.listAdmin));

router.post('/', requireAuth, requireAdmin, validate(createEvenementSchema), asyncHandler(ctrl.create));
router.put('/:id', requireAuth, requireAdmin, validate(updateEvenementSchema), asyncHandler(ctrl.update));
router.delete('/:id', requireAuth, requireAdmin, validate(deleteEvenementSchema), asyncHandler(ctrl.remove));

export default router;
