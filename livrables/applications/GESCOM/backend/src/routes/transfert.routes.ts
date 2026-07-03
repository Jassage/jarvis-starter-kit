import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { requireStock } from '../middleware/rbac';
import { validate } from '../middleware/validate';
import { createTransfertSchema } from '../validation/transfert.schemas';
import * as ctrl from '../controllers/transfert.controller';

const router = Router();

router.get('/', requireAuth, ctrl.list);
router.post('/', requireAuth, requireStock, validate(createTransfertSchema), ctrl.create);
router.patch('/:id/recevoir', requireAuth, requireStock, ctrl.recevoir);
router.patch('/:id/annuler', requireAuth, requireStock, ctrl.annuler);

export default router;
