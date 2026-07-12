import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { requireAgentCredit, requireAdmin } from '../middleware/rbac';
import { validate } from '../middleware/validate';
import { createEpargneSchema } from '../validation/epargne-programme.schemas';
import * as ctrl from '../controllers/epargne-programme.controller';

const router = Router();

router.get('/',          requireAuth, ctrl.list);
router.post('/',         requireAuth, requireAgentCredit, validate(createEpargneSchema), ctrl.create);
router.patch('/:id/toggle', requireAuth, requireAgentCredit, ctrl.toggle);
// Déclenchement du job d'exécution — réservé aux admins, comme /rh/contrats/expire
router.post('/executer', requireAuth, requireAdmin, ctrl.executer);

export default router;
