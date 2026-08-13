import { Router } from 'express';
import * as authController from './auth.controller';
import { validate } from '../../middlewares/validate.middleware';
import { requireAuth } from '../../middlewares/auth.middleware';
import { loginRateLimit } from '../../middlewares/rateLimiter.middleware';
import { loginSchema } from './auth.schemas';

const router = Router();

router.post('/login', loginRateLimit, validate(loginSchema), authController.login);
router.post('/refresh', authController.refresh);
router.post('/logout', authController.logout);
router.get('/me', requireAuth, authController.getMe);

export default router;
