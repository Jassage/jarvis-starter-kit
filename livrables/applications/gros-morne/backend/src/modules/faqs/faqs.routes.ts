import { Router } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import * as ctrl from './faqs.controller';
import { validate } from '../../middlewares/validate.middleware';
import { requireAuth } from '../../middlewares/auth.middleware';
import { requireAdmin } from '../../middlewares/rbac.middleware';
import {
  listFaqsPubliqueSchema,
  listFaqsAdminSchema,
  createFaqSchema,
  updateFaqSchema,
  deleteFaqSchema,
} from './faqs.schemas';

const router = Router();

// Public : la page /faq ne voit jamais les brouillons/archives.
router.get('/', validate(listFaqsPubliqueSchema), asyncHandler(ctrl.listPublique));

router.get('/admin', requireAuth, requireAdmin, validate(listFaqsAdminSchema), asyncHandler(ctrl.listAdmin));

router.post('/', requireAuth, requireAdmin, validate(createFaqSchema), asyncHandler(ctrl.create));
router.put('/:id', requireAuth, requireAdmin, validate(updateFaqSchema), asyncHandler(ctrl.update));
router.delete('/:id', requireAuth, requireAdmin, validate(deleteFaqSchema), asyncHandler(ctrl.remove));

export default router;
