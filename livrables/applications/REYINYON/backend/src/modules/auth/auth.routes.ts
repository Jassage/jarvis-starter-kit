import { Router } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import * as ctrl from './auth.controller';
import { validate } from '../../middlewares/validate.middleware';
import { requireAuth } from '../../middlewares/auth.middleware';
import { authLimiter } from '../../middlewares/rateLimiter.middleware';
import { loginSchema, registerSchema } from './auth.schemas';

const router = Router();

router.post('/register', authLimiter, validate(registerSchema), asyncHandler(ctrl.register));
router.post('/login', authLimiter, validate(loginSchema), asyncHandler(ctrl.login));
router.post('/refresh', asyncHandler(ctrl.refresh));
router.post('/logout', asyncHandler(ctrl.logout));

router.get('/me', requireAuth, asyncHandler(ctrl.getMe));

export default router;
