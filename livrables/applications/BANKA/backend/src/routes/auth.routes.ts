import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { requireAdmin } from '../middleware/rbac';
import * as ctrl from '../controllers/auth.controller';

const router = Router();

router.post('/login', ctrl.login);
router.post('/refresh', ctrl.refresh);
router.post('/logout', requireAuth, ctrl.logout);
router.get('/me', requireAuth, ctrl.getMe);
router.put('/me/password', requireAuth, ctrl.changePassword);

router.get('/utilisateurs', requireAuth, requireAdmin, ctrl.listUtilisateurs);
router.post('/utilisateurs', requireAuth, requireAdmin, ctrl.createUtilisateur);
router.put('/utilisateurs/:id', requireAuth, requireAdmin, ctrl.updateUtilisateur);

export default router;
