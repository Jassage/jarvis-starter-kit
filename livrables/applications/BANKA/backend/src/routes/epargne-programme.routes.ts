import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import * as ctrl from '../controllers/epargne-programme.controller';

const router = Router();

router.get('/',          requireAuth, ctrl.list);
router.post('/',         requireAuth, ctrl.create);
router.patch('/:id/toggle', requireAuth, ctrl.toggle);
router.post('/executer', requireAuth, ctrl.executer);

export default router;
