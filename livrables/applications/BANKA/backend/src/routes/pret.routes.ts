import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { requireSupervisor } from '../middleware/rbac';
import * as ctrl from '../controllers/pret.controller';

const router = Router();

router.get('/', requireAuth, ctrl.list);
router.get('/:id', requireAuth, ctrl.getOne);
router.post('/', requireAuth, ctrl.create);
router.patch('/:id/approuver', requireAuth, requireSupervisor, ctrl.approuver);
router.patch('/:id/rejeter', requireAuth, requireSupervisor, ctrl.rejeter);
router.patch('/:id/decaisser', requireAuth, requireSupervisor, ctrl.decaisser);
router.post('/:id/remboursement', requireAuth, ctrl.rembourser);
router.get('/:id/penalite', requireAuth, ctrl.penalite);
router.post('/refresh-retards', requireAuth, requireSupervisor, ctrl.refreshRetards);

export default router;
