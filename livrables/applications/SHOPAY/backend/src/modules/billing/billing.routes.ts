import { Router } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { requireAuth } from '../../middlewares/auth.middleware';
import { requireMerchant } from '../../middlewares/rbac.middleware';
import { resolveBoutique } from '../../middlewares/tenant.middleware';
import { validate } from '../../middlewares/validate.middleware';
import { uploadImage } from '../../middlewares/upload.middleware';
import { upgradeSchema, submitProofSchema } from './billing.schemas';
import * as ctrl from './billing.controller';

const router = Router();

router.get('/plans', asyncHandler(ctrl.getPlans));

router.use(requireAuth, requireMerchant, resolveBoutique);
router.get('/me', asyncHandler(ctrl.getSubscription));
router.post('/upgrade', validate(upgradeSchema), asyncHandler(ctrl.upgrade));
router.post('/submit-proof', uploadImage.single('screenshot'), validate(submitProofSchema), asyncHandler(ctrl.submitProof));

export default router;
