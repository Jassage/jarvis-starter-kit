import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { requireSupervisor } from '../middleware/rbac';
import * as ctrl from '../controllers/transaction.controller';

const router = Router();

router.get('/', requireAuth, ctrl.list);
router.get('/:id', requireAuth, ctrl.getOne);
router.post('/depot', requireAuth, ctrl.depot);
router.post('/retrait', requireAuth, ctrl.retrait);
router.post('/virement', requireAuth, ctrl.virement);
router.patch('/:id/valider', requireAuth, requireSupervisor, ctrl.valider);
router.patch('/:id/rejeter', requireAuth, requireSupervisor, ctrl.rejeter);

export default router;
