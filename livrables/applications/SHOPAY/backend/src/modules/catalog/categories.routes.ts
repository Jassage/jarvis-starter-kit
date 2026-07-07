import { Router } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { requireAuth } from '../../middlewares/auth.middleware';
import { requireMerchant } from '../../middlewares/rbac.middleware';
import { resolveBoutique } from '../../middlewares/tenant.middleware';
import { validate } from '../../middlewares/validate.middleware';
import { categoryBodySchema } from './categories.schemas';
import * as ctrl from './categories.controller';

const router = Router();
router.use(requireAuth, requireMerchant, resolveBoutique);

router.get('/', asyncHandler(ctrl.list));
router.post('/', validate(categoryBodySchema), asyncHandler(ctrl.create));
router.patch('/:id', validate(categoryBodySchema), asyncHandler(ctrl.update));
router.delete('/:id', asyncHandler(ctrl.remove));

export default router;
