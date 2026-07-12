import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { requireAuth } from '../middleware/auth';
import { requireAdmin } from '../middleware/rbac';
import { validate } from '../middleware/validate';
import {
  loginSchema, refreshSchema, changePasswordSchema, createUtilisateurSchema, updateUtilisateurSchema,
  verify2FASchema, enable2FASchema, disable2FASchema,
  requestPasswordResetSchema, confirmPasswordResetSchema,
} from '../validation/auth.schemas';
import * as ctrl from '../controllers/auth.controller';

const router = Router();

// Rate limit strict sur le reset — 5 demandes / 15 min par IP
const resetRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { success: false, error: 'Trop de demandes de réinitialisation, réessayez dans 15 minutes' },
});

router.post('/login',   validate(loginSchema),   ctrl.login);
router.post('/refresh', validate(refreshSchema), ctrl.refresh);
router.post('/logout', requireAuth, ctrl.logout);
router.get('/me', requireAuth, ctrl.getMe);
router.put('/me/password', requireAuth, validate(changePasswordSchema), ctrl.changePassword);

router.post('/reset-password/request', resetRateLimit, validate(requestPasswordResetSchema), ctrl.requestPasswordReset);
router.post('/reset-password/confirm', resetRateLimit, validate(confirmPasswordResetSchema), ctrl.confirmPasswordReset);

router.post('/2fa/verify', validate(verify2FASchema), ctrl.verify2FA);
router.post('/2fa/setup',   requireAuth, ctrl.setup2FA);
router.post('/2fa/enable',  requireAuth, validate(enable2FASchema),  ctrl.enable2FA);
router.post('/2fa/disable', requireAuth, validate(disable2FASchema), ctrl.disable2FA);

router.get('/utilisateurs', requireAuth, requireAdmin, ctrl.listUtilisateurs);
router.post('/utilisateurs', requireAuth, requireAdmin, validate(createUtilisateurSchema), ctrl.createUtilisateur);
router.put('/utilisateurs/:id', requireAuth, requireAdmin, validate(updateUtilisateurSchema), ctrl.updateUtilisateur);

export default router;
