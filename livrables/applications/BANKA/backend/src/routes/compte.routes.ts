import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { requireSupervisor, requireAgentCredit } from '../middleware/rbac';
import { validate } from '../middleware/validate';
import { createCompteSchema, updateCompteSchema } from '../validation/client.schemas';
import { createMandatSchema, updateMandatSchema } from '../validation/mandat.schemas';
import * as ctrl from '../controllers/compte.controller';
import * as mandatCtrl from '../controllers/mandat.controller';

const router = Router();

router.get('/', requireAuth, ctrl.list);
router.get('/:id', requireAuth, ctrl.getOne);
router.get('/:id/releve', requireAuth, ctrl.getReleve);
router.post('/', requireAuth, requireAgentCredit, validate(createCompteSchema), ctrl.create);
router.put('/:id', requireAuth, requireSupervisor, validate(updateCompteSchema), ctrl.update);
router.patch('/:id/statut', requireAuth, requireSupervisor, ctrl.changeStatut);

router.post('/:id/cloturer', requireAuth, requireSupervisor, ctrl.cloturer);

router.get('/:id/mandats', requireAuth, mandatCtrl.list);
router.post('/:id/mandats', requireAuth, requireAgentCredit, validate(createMandatSchema), mandatCtrl.create);
router.put('/:id/mandats/:mandatId', requireAuth, requireAgentCredit, validate(updateMandatSchema), mandatCtrl.update);
router.delete('/:id/mandats/:mandatId', requireAuth, requireAgentCredit, mandatCtrl.revoquer);

export default router;
