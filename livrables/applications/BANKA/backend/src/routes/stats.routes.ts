import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { requireRole } from '../middleware/rbac';
import * as ctrl from '../controllers/stats.controller';

const router = Router();

router.get('/dashboard', requireAuth, ctrl.dashboard);
router.get('/rapport-journalier', requireAuth, ctrl.rapportJournalier);
router.get('/par', requireAuth, ctrl.par);
router.get('/tendance', requireAuth, ctrl.tendance);
router.get('/alertes', requireAuth, ctrl.alertes);
router.get('/rapport-brh', requireAuth, requireRole('SUPER_ADMIN', 'DIRECTEUR', 'AUDITEUR'), ctrl.rapportBRH);

export default router;
