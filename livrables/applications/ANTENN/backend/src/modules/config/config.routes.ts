import { Router } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import * as ctrl from './config.controller';
import { validate } from '../../middlewares/validate.middleware';
import { requireAuth } from '../../middlewares/auth.middleware';
import { uploadLogoChaine } from '../../middlewares/upload.middleware';
import { updateConfigSchema } from './config.schemas';

const router = Router();

// Config d'identité de la chaîne : gérée par les deux rôles (décision produit).
router.use(requireAuth);

router.get('/', asyncHandler(ctrl.getConfig));
router.patch('/', validate(updateConfigSchema), asyncHandler(ctrl.updateConfig));
router.post('/logo', uploadLogoChaine.single('logo'), asyncHandler(ctrl.uploadLogo));

export default router;
