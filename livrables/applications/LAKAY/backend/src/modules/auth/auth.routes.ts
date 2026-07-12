import { Router } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import * as ctrl from './auth.controller';
import { validate } from '../../middlewares/validate.middleware';
import { requireAuth } from '../../middlewares/auth.middleware';
import { authLimiter } from '../../middlewares/rateLimiter.middleware';
import { uploadAvatar } from '../../middlewares/upload.middleware';
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  verifyEmailSchema,
  updateProfileSchema,
  changePasswordSchema,
} from './auth.schemas';

const router = Router();

// Auth publique
router.post('/register', authLimiter, validate(registerSchema), asyncHandler(ctrl.register));
router.post('/login', authLimiter, validate(loginSchema), asyncHandler(ctrl.login));
// refreshToken transite désormais uniquement via le cookie httpOnly, jamais dans le body
router.post('/refresh', asyncHandler(ctrl.refresh));
router.post('/logout', asyncHandler(ctrl.logout));
router.post('/forgot-password', authLimiter, validate(forgotPasswordSchema), asyncHandler(ctrl.forgotPassword));
router.post('/reset-password', authLimiter, validate(resetPasswordSchema), asyncHandler(ctrl.resetPassword));
router.get('/verify-email/:token', validate(verifyEmailSchema), asyncHandler(ctrl.verifyEmail));

// Auth protégée
router.get('/me', requireAuth, asyncHandler(ctrl.getMe));
router.patch('/me', requireAuth, validate(updateProfileSchema), asyncHandler(ctrl.updateProfile));
router.patch('/change-password', requireAuth, validate(changePasswordSchema), asyncHandler(ctrl.changePassword));
router.post('/avatar', requireAuth, uploadAvatar.single('avatar'), asyncHandler(ctrl.uploadAvatar));

export default router;
