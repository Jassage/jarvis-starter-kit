import { Router } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import * as ctrl from './sections-communales.controller';
import { validate } from '../../middlewares/validate.middleware';
import { requireAuth } from '../../middlewares/auth.middleware';
import { requireAdmin } from '../../middlewares/rbac.middleware';
import {
  listSectionsCommunalesSchema,
  createSectionCommunaleSchema,
  updateSectionCommunaleSchema,
  deleteSectionCommunaleSchema,
} from './sections-communales.schemas';

const router = Router();

// Public : la page /geographie consomme cette liste sans authentification.
router.get('/', validate(listSectionsCommunalesSchema), asyncHandler(ctrl.list));

router.post('/', requireAuth, requireAdmin, validate(createSectionCommunaleSchema), asyncHandler(ctrl.create));
router.put('/:id', requireAuth, requireAdmin, validate(updateSectionCommunaleSchema), asyncHandler(ctrl.update));
router.delete('/:id', requireAuth, requireAdmin, validate(deleteSectionCommunaleSchema), asyncHandler(ctrl.remove));

export default router;
