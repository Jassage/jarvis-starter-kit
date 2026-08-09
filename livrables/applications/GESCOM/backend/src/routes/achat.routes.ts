import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { requireStock } from '../middleware/rbac';
import { validate } from '../middleware/validate';
import { scopeEmplacementQuery, requireOwnEmplacementBody } from '../middleware/emplacementScope';
import { createCommandeSchema, receptionCommandeSchema } from '../validation/achat.schemas';
import * as ctrl from '../controllers/achat.controller';

const router = Router();

router.get('/', requireAuth, scopeEmplacementQuery(), ctrl.list);
router.post('/', requireAuth, requireStock, validate(createCommandeSchema), requireOwnEmplacementBody('emplacementId'), ctrl.create);
router.patch('/:id/envoyer', requireAuth, requireStock, ctrl.envoyer);
router.patch('/:id/recevoir', requireAuth, requireStock, validate(receptionCommandeSchema), ctrl.recevoir);
router.patch('/:id/annuler', requireAuth, requireStock, ctrl.annuler);

export default router;
