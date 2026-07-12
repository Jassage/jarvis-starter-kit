import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { requireAdmin } from '../middleware/rbac';
import { validate } from '../middleware/validate';
import { createDeviceSchema, updateDeviceSchema } from '../validation/device.schemas';
import * as ctrl from '../controllers/device.controller';

const router = Router();

router.get('/',    requireAuth, requireAdmin, ctrl.listDevices);
router.post('/',   requireAuth, requireAdmin, validate(createDeviceSchema), ctrl.createDevice);
router.put('/:id', requireAuth, requireAdmin, validate(updateDeviceSchema), ctrl.updateDevice);
router.delete('/:id', requireAuth, requireAdmin, ctrl.deleteDevice);

export default router;
