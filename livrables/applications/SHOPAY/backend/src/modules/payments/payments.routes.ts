import { Router } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { validate } from '../../middlewares/validate.middleware';
import { uploadImage } from '../../middlewares/upload.middleware';
import { orderCheckoutSessionSchema, orderMoncashInitiateSchema, submitOrderProofSchema } from './payments.schemas';
import * as ctrl from './payments.controller';

const router = Router();

// Toutes ces routes sont publiques : le paiement d'une commande n'exige pas de compte
// (checkout invité, cf. décision produit). La signature webhook MonCash reste vérifiée
// par secret partagé ; le webhook Stripe est monté séparément dans app.ts (raw body).
router.post('/stripe/checkout-session', validate(orderCheckoutSessionSchema), asyncHandler(ctrl.createOrderCheckoutSession));
router.post('/moncash/initiate', validate(orderMoncashInitiateSchema), asyncHandler(ctrl.initiateOrderMoncash));
router.post('/moncash/callback', asyncHandler(ctrl.moncashCallback));
router.get('/methods', asyncHandler(ctrl.getMoncashMethods));
router.post(
  '/submit-proof',
  uploadImage.single('screenshot'),
  validate(submitOrderProofSchema),
  asyncHandler(ctrl.submitOrderProof)
);

export default router;
