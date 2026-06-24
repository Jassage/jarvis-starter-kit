import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import * as ctrl from '../controllers/stats.controller';

const router = Router();

router.get('/dashboard', requireAuth, ctrl.dashboard);
router.get('/rapport-journalier', requireAuth, ctrl.rapportJournalier);
router.get('/par', requireAuth, ctrl.par);

export default router;
