import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import * as ctrl from '../controllers/caisse.controller';

const router = Router();

router.get('/active', requireAuth, ctrl.sessionActive);
router.get('/', requireAuth, ctrl.list);
router.get('/:id', requireAuth, ctrl.getOne);
router.get('/:id/arrete', requireAuth, ctrl.arrete);
router.post('/', requireAuth, ctrl.ouvrir);
router.patch('/:id/fermer', requireAuth, ctrl.fermer);

export default router;
