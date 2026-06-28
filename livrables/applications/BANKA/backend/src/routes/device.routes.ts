import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { requireAdmin } from '../middleware/rbac';
import * as ctrl from '../controllers/device.controller';

const router = Router();

router.get('/',    requireAuth, requireAdmin, ctrl.listDevices);
router.post('/',   requireAuth, requireAdmin, ctrl.createDevice);
router.put('/:id', requireAuth, requireAdmin, ctrl.updateDevice);
router.delete('/:id', requireAuth, requireAdmin, ctrl.deleteDevice);

export default router;
