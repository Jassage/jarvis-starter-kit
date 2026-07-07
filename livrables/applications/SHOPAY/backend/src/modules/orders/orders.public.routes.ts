import { Router } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { validate } from '../../middlewares/validate.middleware';
import { checkoutLimiter } from '../../middlewares/rateLimiter.middleware';
import { checkoutSchema } from './orders.schemas';
import * as ctrl from './orders.public.controller';

const router = Router({ mergeParams: true });

router.post('/checkout', checkoutLimiter, validate(checkoutSchema), asyncHandler(ctrl.checkout));
router.get('/orders/lookup', asyncHandler(ctrl.lookup));

export default router;
