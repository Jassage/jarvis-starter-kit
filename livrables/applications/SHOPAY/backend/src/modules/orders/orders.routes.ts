import { Router } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { requireAuth } from '../../middlewares/auth.middleware';
import { requireMerchant } from '../../middlewares/rbac.middleware';
import { resolveBoutique } from '../../middlewares/tenant.middleware';
import { validate } from '../../middlewares/validate.middleware';
import { updateOrderStatusSchema } from './orders.schemas';
import * as ctrl from './orders.controller';

const router = Router();
router.use(requireAuth, requireMerchant, resolveBoutique);

router.get('/', asyncHandler(ctrl.list));
router.get('/:id', asyncHandler(ctrl.getOne));
router.patch('/:id/status', validate(updateOrderStatusSchema), asyncHandler(ctrl.updateStatus));

export default router;
