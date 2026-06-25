import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import * as ctrl from '../controllers/compta.controller';

const router = Router();

router.get('/dashboard',      requireAuth, ctrl.dashboard);
router.get('/plan-comptable',        requireAuth, ctrl.planComptable);
router.post('/plan-comptable',       requireAuth, ctrl.createCompte);
router.put('/plan-comptable/:id',    requireAuth, ctrl.updateCompte);
router.delete('/plan-comptable/:id', requireAuth, ctrl.deleteCompte);
router.get('/journal',               requireAuth, ctrl.journal);
router.post('/journal',              requireAuth, ctrl.createEcriture);
router.delete('/journal/:id',        requireAuth, ctrl.deleteEcriture);
router.get('/grand-livre',    requireAuth, ctrl.grandLivre);
router.get('/bilan',          requireAuth, ctrl.bilan);
router.get('/resultat',       requireAuth, ctrl.resultat);

export default router;
