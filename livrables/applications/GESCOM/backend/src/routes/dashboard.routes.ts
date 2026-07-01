import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import * as ctrl from '../controllers/dashboard.controller';

const router = Router();

router.get('/stats', requireAuth, ctrl.getStats);

export default router;
