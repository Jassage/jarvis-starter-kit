import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { requireStock } from '../middleware/rbac';
import { validate } from '../middleware/validate';
import { scopeEmplacementQuery, requireOwnEmplacementBody } from '../middleware/emplacementScope';
import { ajustementStockSchema } from '../validation/stock.schemas';
import * as ctrl from '../controllers/stock.controller';

const router = Router();

router.get('/', requireAuth, scopeEmplacementQuery(), ctrl.list);
router.get('/mouvements', requireAuth, scopeEmplacementQuery(), ctrl.listMouvements);
router.get('/alertes', requireAuth, scopeEmplacementQuery(), ctrl.listAlertes);
router.post('/ajustement', requireAuth, requireStock, validate(ajustementStockSchema), requireOwnEmplacementBody('emplacementId'), ctrl.ajuster);

export default router;
