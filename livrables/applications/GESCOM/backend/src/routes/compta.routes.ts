import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { requireComptable } from '../middleware/rbac';
import { validate } from '../middleware/validate';
import { createEcritureSchema } from '../validation/compta.schemas';
import * as ctrl from '../controllers/compta.controller';

const router = Router();

router.use(requireAuth, requireComptable);

router.get('/dashboard', ctrl.dashboard);
router.get('/plan-comptable', ctrl.planComptable);
router.get('/journal', ctrl.journal);
router.post('/journal', validate(createEcritureSchema), ctrl.createEcriture);
router.get('/grand-livre/:compteId', ctrl.grandLivre);
router.get('/bilan', ctrl.bilan);
router.get('/resultat', ctrl.resultat);
router.get('/echecs', ctrl.listEchecs);
router.patch('/echecs/:id/resoudre', ctrl.resoudreEchec);

export default router;
