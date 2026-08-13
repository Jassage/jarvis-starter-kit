import { Router } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import * as ctrl from './activity-log.controller';
import { validate } from '../../middlewares/validate.middleware';
import { requireAuth } from '../../middlewares/auth.middleware';
import { requireAdmin } from '../../middlewares/rbac.middleware';
import { listActivityLogSchema } from './activity-log.schemas';

const router = Router();

// Entièrement réservé à l'admin : c'est le journal des actions admin elles-mêmes.
router.get('/', requireAuth, requireAdmin, validate(listActivityLogSchema), asyncHandler(ctrl.list));
router.get('/entites', requireAuth, requireAdmin, asyncHandler(ctrl.listEntites));

export default router;
