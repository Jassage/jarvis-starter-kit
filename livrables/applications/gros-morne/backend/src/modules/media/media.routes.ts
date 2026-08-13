import { Router } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import * as ctrl from './media.controller';
import { requireAuth } from '../../middlewares/auth.middleware';
import { requireAdmin } from '../../middlewares/rbac.middleware';
import { uploadMedia } from '../../middlewares/upload.middleware';

const router = Router();

router.post('/', requireAuth, requireAdmin, uploadMedia.single('fichier'), asyncHandler(ctrl.upload));
router.get('/', requireAuth, requireAdmin, asyncHandler(ctrl.list));

export default router;
