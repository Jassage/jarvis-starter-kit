import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import * as ctrl from '../controllers/emplacement.controller';

const router = Router();

router.get('/', requireAuth, ctrl.list);

export default router;
