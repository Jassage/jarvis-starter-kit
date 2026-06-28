import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { requireSupervisor } from '../middleware/rbac';
import { financialRateLimit } from '../middleware/rateLimiter';
import { validate } from '../middleware/validate';
import { requireCaisseOuverte } from '../middleware/caisse';
import { depotSchema, retraitSchema, virementSchema, rejeterTransactionSchema } from '../validation/transaction.schemas';
import * as ctrl from '../controllers/transaction.controller';

const router = Router();

router.get('/', requireAuth, ctrl.list);
router.get('/:id', requireAuth, ctrl.getOne);
router.post('/depot',    requireAuth, requireCaisseOuverte, financialRateLimit, validate(depotSchema),    ctrl.depot);
router.post('/retrait',  requireAuth, requireCaisseOuverte, financialRateLimit, validate(retraitSchema),  ctrl.retrait);
router.post('/virement', requireAuth, requireCaisseOuverte, financialRateLimit, validate(virementSchema), ctrl.virement);
router.patch('/:id/valider', requireAuth, requireSupervisor, ctrl.valider);
router.patch('/:id/rejeter', requireAuth, requireSupervisor, validate(rejeterTransactionSchema), ctrl.rejeter);

export default router;
