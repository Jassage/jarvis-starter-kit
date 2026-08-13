import { Router } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import * as ctrl from './videos.controller';
import { validate } from '../../middlewares/validate.middleware';
import { requireAuth } from '../../middlewares/auth.middleware';
import { requireAdmin } from '../../middlewares/rbac.middleware';
import {
  listVideosPubliqueSchema,
  listVideosAdminSchema,
  createVideoSchema,
  updateVideoSchema,
  deleteVideoSchema,
} from './videos.schemas';

const router = Router();

router.get('/', validate(listVideosPubliqueSchema), asyncHandler(ctrl.listPublique));
router.get('/admin', requireAuth, requireAdmin, validate(listVideosAdminSchema), asyncHandler(ctrl.listAdmin));

router.post('/', requireAuth, requireAdmin, validate(createVideoSchema), asyncHandler(ctrl.create));
router.put('/:id', requireAuth, requireAdmin, validate(updateVideoSchema), asyncHandler(ctrl.update));
router.delete('/:id', requireAuth, requireAdmin, validate(deleteVideoSchema), asyncHandler(ctrl.remove));

export default router;
