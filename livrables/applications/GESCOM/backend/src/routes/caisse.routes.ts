import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { requireVente } from '../middleware/rbac';
import { validate } from '../middleware/validate';
import { scopeEmplacementQuery, requireOwnEmplacementBody } from '../middleware/emplacementScope';
import { ouvrirSessionSchema, fermerSessionSchema } from '../validation/caisse.schemas';
import * as ctrl from '../controllers/caisse.controller';

const router = Router();

router.get('/active', requireAuth, scopeEmplacementQuery(), ctrl.active);
router.get('/', requireAuth, scopeEmplacementQuery(), ctrl.list);
router.get('/:id', requireAuth, ctrl.getOne);
router.post('/ouvrir', requireAuth, requireVente, validate(ouvrirSessionSchema), requireOwnEmplacementBody('emplacementId'), ctrl.ouvrir);
router.patch('/:id/fermer', requireAuth, requireVente, validate(fermerSessionSchema), ctrl.fermer);

export default router;
