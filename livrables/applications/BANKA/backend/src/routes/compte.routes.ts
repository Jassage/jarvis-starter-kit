import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createCompteSchema } from '../validation/client.schemas';
import * as ctrl from '../controllers/compte.controller';
import * as mandatCtrl from '../controllers/mandat.controller';

const router = Router();

router.get('/', requireAuth, ctrl.list);
router.get('/:id', requireAuth, ctrl.getOne);
router.get('/:id/releve', requireAuth, ctrl.getReleve);
router.post('/', requireAuth, validate(createCompteSchema), ctrl.create);
router.put('/:id', requireAuth, ctrl.update);
router.patch('/:id/statut', requireAuth, ctrl.changeStatut);

router.post('/:id/cloturer', requireAuth, ctrl.cloturer);

router.get('/:id/mandats', requireAuth, mandatCtrl.list);
router.post('/:id/mandats', requireAuth, mandatCtrl.create);
router.put('/:id/mandats/:mandatId', requireAuth, mandatCtrl.update);
router.delete('/:id/mandats/:mandatId', requireAuth, mandatCtrl.revoquer);

export default router;
