import { Router } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { requireAuth } from '../../middlewares/auth.middleware';
import { requireMerchant } from '../../middlewares/rbac.middleware';
import { resolveBoutique } from '../../middlewares/tenant.middleware';
import * as ctrl from './notifications.controller';

const router = Router();
router.use(requireAuth, requireMerchant, resolveBoutique);

router.get('/', asyncHandler(ctrl.list));
router.patch('/:id/read', asyncHandler(ctrl.markAsRead));

export default router;
