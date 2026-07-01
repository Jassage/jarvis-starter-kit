import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { requireAdmin } from '../middleware/rbac';
import { validate } from '../middleware/validate';
import {
  loginSchema, refreshSchema, changePasswordSchema, createUtilisateurSchema,
} from '../validation/auth.schemas';
import * as ctrl from '../controllers/auth.controller';

const router = Router();

router.post('/login', validate(loginSchema), ctrl.login);
router.post('/refresh', validate(refreshSchema), ctrl.refresh);
router.post('/logout', requireAuth, ctrl.logout);
router.get('/me', requireAuth, ctrl.getMe);
router.put('/me/password', requireAuth, validate(changePasswordSchema), ctrl.changePassword);

router.get('/utilisateurs', requireAuth, requireAdmin, ctrl.listUtilisateurs);
router.post('/utilisateurs', requireAuth, requireAdmin, validate(createUtilisateurSchema), ctrl.createUtilisateur);
router.put('/utilisateurs/:id', requireAuth, requireAdmin, ctrl.updateUtilisateur);

export default router;
