import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { requireAdmin } from '../middleware/rbac';
import { validate } from '../middleware/validate';
import { loginSchema, refreshSchema, changePasswordSchema, createUtilisateurSchema, verify2FASchema, enable2FASchema, disable2FASchema } from '../validation/auth.schemas';
import * as ctrl from '../controllers/auth.controller';

const router = Router();

router.post('/login',   validate(loginSchema),   ctrl.login);
router.post('/refresh', validate(refreshSchema), ctrl.refresh);
router.post('/logout', requireAuth, ctrl.logout);
router.get('/me', requireAuth, ctrl.getMe);
router.put('/me/password', requireAuth, validate(changePasswordSchema), ctrl.changePassword);

router.post('/2fa/verify', validate(verify2FASchema), ctrl.verify2FA);
router.post('/2fa/setup',   requireAuth, ctrl.setup2FA);
router.post('/2fa/enable',  requireAuth, validate(enable2FASchema),  ctrl.enable2FA);
router.post('/2fa/disable', requireAuth, validate(disable2FASchema), ctrl.disable2FA);

router.get('/utilisateurs', requireAuth, requireAdmin, ctrl.listUtilisateurs);
router.post('/utilisateurs', requireAuth, requireAdmin, validate(createUtilisateurSchema), ctrl.createUtilisateur);
router.put('/utilisateurs/:id', requireAuth, requireAdmin, ctrl.updateUtilisateur);

export default router;
