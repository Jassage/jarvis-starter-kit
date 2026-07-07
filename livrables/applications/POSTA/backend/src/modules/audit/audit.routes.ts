import { Router } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import * as ctrl from './audit.controller';
import { requireAuth } from '../../middlewares/auth.middleware';
import { requireSuperAdmin } from '../../middlewares/rbac.middleware';

const router = Router();

router.use(requireAuth, requireSuperAdmin);

router.get('/', asyncHandler(ctrl.listAuditLogs));

export default router;
