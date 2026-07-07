import { Router } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { requireAuth } from '../../middlewares/auth.middleware';
import { resolveBoutique } from '../../middlewares/tenant.middleware';
import { validate } from '../../middlewares/validate.middleware';
import { uploadImage } from '../../middlewares/upload.middleware';
import { updateBoutiqueSchema } from './boutiques.schemas';
import * as ctrl from './boutiques.controller';

const router = Router();

router.get('/slug-available', asyncHandler(ctrl.checkSlugAvailability));

router.use(requireAuth, resolveBoutique);
router.get('/mine', asyncHandler(ctrl.getMine));
router.patch('/mine', validate(updateBoutiqueSchema), asyncHandler(ctrl.updateMine));
router.post('/mine/logo', uploadImage.single('logo'), asyncHandler(ctrl.uploadLogo));

export default router;
