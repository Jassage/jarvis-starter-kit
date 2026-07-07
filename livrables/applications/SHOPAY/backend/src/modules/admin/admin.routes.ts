import { Router } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { requireAuth } from '../../middlewares/auth.middleware';
import { requirePlatformAdmin } from '../../middlewares/rbac.middleware';
import { validate } from '../../middlewares/validate.middleware';
import { updateBoutiqueStatusSchema, rejectPaymentSchema } from './admin.schemas';
import * as ctrl from './admin.controller';

const router = Router();
router.use(requireAuth, requirePlatformAdmin);

router.get('/boutiques', asyncHandler(ctrl.listBoutiques));
router.patch('/boutiques/:id/status', validate(updateBoutiqueStatusSchema), asyncHandler(ctrl.updateBoutiqueStatus));
router.get('/stats', asyncHandler(ctrl.getStats));
router.get('/payments', asyncHandler(ctrl.listPendingPayments));
router.post('/payments/:id/approve', asyncHandler(ctrl.approvePayment));
router.post('/payments/:id/reject', validate(rejectPaymentSchema), asyncHandler(ctrl.rejectPayment));

export default router;
