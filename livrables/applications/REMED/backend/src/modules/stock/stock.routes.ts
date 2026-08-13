import { Router } from 'express';
import * as stockController from './stock.controller';
import { validate } from '../../middlewares/validate.middleware';
import { requireAuth } from '../../middlewares/auth.middleware';
import { requireStock } from '../../middlewares/rbac.middleware';
import { entreeStockSchema, ajustementStockSchema, listMouvementsQuerySchema, alertesPeremptionQuerySchema } from './stock.schemas';

const router = Router();

router.use(requireAuth);
router.get('/lots', stockController.listLots);
router.get('/mouvements', validate(listMouvementsQuerySchema), stockController.listMouvements);
router.get('/alertes/peremption', validate(alertesPeremptionQuerySchema), stockController.alertesPeremption);
router.get('/alertes/stock-bas', stockController.alertesStockBas);
router.post('/entrees', requireStock, validate(entreeStockSchema), stockController.entree);
router.post('/ajustements', requireStock, validate(ajustementStockSchema), stockController.ajuster);

export default router;
