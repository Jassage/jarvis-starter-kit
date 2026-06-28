import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createClientSchema } from '../validation/client.schemas';
import * as ctrl from '../controllers/client.controller';

const router = Router();

router.get('/search', requireAuth, ctrl.search);
router.get('/', requireAuth, ctrl.list);
router.get('/:id', requireAuth, ctrl.getOne);
router.post('/', requireAuth, validate(createClientSchema), ctrl.create);
router.put('/:id', requireAuth, ctrl.update);
router.patch('/:id/statut', requireAuth, ctrl.changeStatut);

export default router;
