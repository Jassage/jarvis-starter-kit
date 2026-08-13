import { Router } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import * as ctrl from './site-settings.controller';
import { validate } from '../../middlewares/validate.middleware';
import { requireAuth } from '../../middlewares/auth.middleware';
import { requireAdmin } from '../../middlewares/rbac.middleware';
import { updateSiteSettingsSchema } from './site-settings.schemas';

const router = Router();

// Public : footer + page Contact consomment ces paramètres sans authentification.
router.get('/', asyncHandler(ctrl.get));

router.put('/', requireAuth, requireAdmin, validate(updateSiteSettingsSchema), asyncHandler(ctrl.update));

export default router;
