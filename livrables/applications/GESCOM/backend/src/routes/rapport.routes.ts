import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { requireAdmin } from '../middleware/rbac';
import * as ctrl from '../controllers/rapport.controller';

const router = Router();

router.use(requireAuth, requireAdmin);

router.get('/ventes', ctrl.ventes);
router.get('/stock', ctrl.stock);
router.get('/achats', ctrl.achats);
router.get('/clients', ctrl.clients);

export default router;
