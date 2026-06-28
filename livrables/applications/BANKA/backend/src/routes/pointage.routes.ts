import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { requireSupervisor } from '../middleware/rbac';
import * as ctrl from '../controllers/pointage.controller';

const router = Router();

router.get('/',           requireAuth, requireSupervisor, ctrl.listPointages);
router.get('/journalier', requireAuth, requireSupervisor, ctrl.getJournalier);
router.get('/stats',      requireAuth, requireSupervisor, ctrl.getStats);
router.post('/',          requireAuth, requireSupervisor, ctrl.upsertPointage);
router.post('/bulk',      requireAuth, requireSupervisor, ctrl.bulkUpsert);
router.delete('/:id',     requireAuth, requireSupervisor, ctrl.deletePointage);

export default router;
