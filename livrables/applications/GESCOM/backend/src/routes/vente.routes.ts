import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { requireVente } from '../middleware/rbac';
import { validate } from '../middleware/validate';
import { scopeEmplacementQuery, requireOwnEmplacementBody } from '../middleware/emplacementScope';
import { createVenteSchema } from '../validation/vente.schemas';
import { createRetourSchema } from '../validation/retour.schemas';
import * as ctrl from '../controllers/vente.controller';
import * as retourCtrl from '../controllers/retour.controller';

const router = Router();

router.get('/', requireAuth, scopeEmplacementQuery(), ctrl.list);
router.get('/:id', requireAuth, ctrl.getOne);
router.get('/:id/facture', requireAuth, ctrl.facture);
router.get('/:id/retours', requireAuth, retourCtrl.list);
router.post('/', requireAuth, requireVente, validate(createVenteSchema), requireOwnEmplacementBody('emplacementId'), ctrl.create);
router.post('/:id/retours', requireAuth, requireVente, validate(createRetourSchema), retourCtrl.create);
router.patch('/:id/annuler', requireAuth, requireVente, ctrl.cancel);

export default router;
