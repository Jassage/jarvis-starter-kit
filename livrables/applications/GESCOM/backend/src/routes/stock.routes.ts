import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { requireStock } from '../middleware/rbac';
import { validate } from '../middleware/validate';
import { ajustementStockSchema } from '../validation/stock.schemas';
import * as ctrl from '../controllers/stock.controller';

const router = Router();

router.get('/', requireAuth, ctrl.list);
router.get('/mouvements', requireAuth, ctrl.listMouvements);
router.get('/alertes', requireAuth, ctrl.listAlertes);
router.post('/ajustement', requireAuth, requireStock, validate(ajustementStockSchema), ctrl.ajuster);

export default router;
