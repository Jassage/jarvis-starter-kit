import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import * as ctrl from '../controllers/client.controller';

const router = Router();

router.get('/search', requireAuth, ctrl.search);
router.get('/', requireAuth, ctrl.list);
router.get('/:id', requireAuth, ctrl.getOne);
router.post('/', requireAuth, ctrl.create);
router.put('/:id', requireAuth, ctrl.update);
router.patch('/:id/statut', requireAuth, ctrl.changeStatut);

export default router;
