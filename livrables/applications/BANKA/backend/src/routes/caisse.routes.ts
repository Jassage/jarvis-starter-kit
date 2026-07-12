import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { requireCaissier } from '../middleware/rbac';
import * as ctrl from '../controllers/caisse.controller';

const router = Router();

router.get('/active', requireAuth, ctrl.sessionActive);
router.get('/solde-actuel', requireAuth, ctrl.soldeActuel);
router.get('/', requireAuth, ctrl.list);
router.get('/:id', requireAuth, ctrl.getOne);
router.get('/:id/arrete', requireAuth, ctrl.arrete);
router.post('/', requireAuth, requireCaissier, ctrl.ouvrir);
router.patch('/:id/fermer', requireAuth, requireCaissier, ctrl.fermer);

export default router;
