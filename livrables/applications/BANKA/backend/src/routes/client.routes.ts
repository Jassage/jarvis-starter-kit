import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { requireRole } from '../middleware/rbac';
import { validate } from '../middleware/validate';
import { createClientSchema, updateClientSchema, changeStatutClientSchema } from '../validation/client.schemas';
import * as ctrl from '../controllers/client.controller';

const router = Router();

router.get('/search', requireAuth, ctrl.search);
router.get('/', requireAuth, ctrl.list);
router.get('/:id', requireAuth, ctrl.getOne);
router.post('/', requireAuth, validate(createClientSchema), ctrl.create);
router.put('/:id', requireAuth, validate(updateClientSchema), ctrl.update);
router.patch('/:id/statut', requireAuth, validate(changeStatutClientSchema), ctrl.changeStatut);
// Suppression logique — réservée aux superviseurs+ pour éviter les erreurs caissier
router.delete('/:id', requireAuth, requireRole('SUPER_ADMIN', 'DIRECTEUR', 'SUPERVISEUR'), ctrl.deleteOne);

export default router;
