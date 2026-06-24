import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { requireAdmin } from '../middleware/rbac';
import * as ctrl from '../controllers/configuration.controller';

const router = Router();

router.get('/', requireAuth, ctrl.list);
router.put('/:cle', requireAuth, requireAdmin, ctrl.update);
router.post('/bulk', requireAuth, requireAdmin, ctrl.bulkUpdate);

export default router;
