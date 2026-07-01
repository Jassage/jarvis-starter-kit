import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { requireVente } from '../middleware/rbac';
import { validate } from '../middleware/validate';
import { createVenteSchema } from '../validation/vente.schemas';
import * as ctrl from '../controllers/vente.controller';

const router = Router();

router.get('/', requireAuth, ctrl.list);
router.get('/:id', requireAuth, ctrl.getOne);
router.post('/', requireAuth, requireVente, validate(createVenteSchema), ctrl.create);
router.patch('/:id/annuler', requireAuth, requireVente, ctrl.cancel);

export default router;
