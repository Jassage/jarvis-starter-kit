import { Router } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import * as ctrl from './billing.controller';
import { validate } from '../../middlewares/validate.middleware';
import { requireAuth } from '../../middlewares/auth.middleware';
import { requireSuperAdmin } from '../../middlewares/rbac.middleware';
import {
  initiateMoncashSchema,
  submitProofSchema,
  checkoutSchema,
  paymentIdParamSchema,
} from './billing.schemas';

const router = Router();

// Public : les prix des plans sont affichés sur la page tarifs avant toute connexion.
router.get('/plans', asyncHandler(ctrl.getPlans));

router.use(requireAuth);

router.get('/subscription', asyncHandler(ctrl.getSubscription));
router.post('/moncash/initiate', validate(initiateMoncashSchema), asyncHandler(ctrl.initiateMoncash));
router.post('/moncash/submit-proof', validate(submitProofSchema), asyncHandler(ctrl.submitMoncashProof));
router.post('/stripe/checkout', validate(checkoutSchema), asyncHandler(ctrl.createCheckoutSession));

router.get('/admin/payments', requireSuperAdmin, asyncHandler(ctrl.listPendingPayments));
router.post(
  '/admin/payments/:id/approve',
  requireSuperAdmin,
  validate(paymentIdParamSchema),
  asyncHandler(ctrl.approvePayment)
);
router.post(
  '/admin/payments/:id/reject',
  requireSuperAdmin,
  validate(paymentIdParamSchema),
  asyncHandler(ctrl.rejectPayment)
);

export default router;
