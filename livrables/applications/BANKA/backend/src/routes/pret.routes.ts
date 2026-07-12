import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { requireSupervisor, requireAgentCredit, requireCaissier } from '../middleware/rbac';
import { validate } from '../middleware/validate';
import { createGarantieSchema, updateGarantieSchema } from '../validation/garantie.schemas';
import * as ctrl from '../controllers/pret.controller';
import * as garantieCtrl from '../controllers/garantie.controller';

const router = Router();

router.get('/', requireAuth, ctrl.list);
router.post('/refresh-retards', requireAuth, requireSupervisor, ctrl.refreshRetards);
router.get('/:id', requireAuth, ctrl.getOne);
router.post('/', requireAuth, requireAgentCredit, ctrl.create);
router.patch('/:id/approuver', requireAuth, requireSupervisor, ctrl.approuver);
router.patch('/:id/rejeter',  requireAuth, requireSupervisor, ctrl.rejeter);
router.patch('/:id/annuler',  requireAuth, requireSupervisor, ctrl.annuler);
router.patch('/:id/decaisser', requireAuth, requireSupervisor, ctrl.decaisser);
router.post('/:id/remboursement', requireAuth, requireCaissier, ctrl.rembourser);
router.get('/:id/penalite', requireAuth, ctrl.penalite);

router.get('/:id/garanties', requireAuth, garantieCtrl.list);
router.post('/:id/garanties', requireAuth, requireAgentCredit, validate(createGarantieSchema), garantieCtrl.create);
router.put('/:id/garanties/:garantieId', requireAuth, requireAgentCredit, validate(updateGarantieSchema), garantieCtrl.update);

export default router;
