import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { requireVente } from '../middleware/rbac';
import { validate } from '../middleware/validate';
import { createClientSchema, updateClientSchema } from '../validation/client.schemas';
import * as ctrl from '../controllers/client.controller';

const router = Router();

router.get('/', requireAuth, ctrl.list);
router.post('/', requireAuth, requireVente, validate(createClientSchema), ctrl.create);
router.put('/:id', requireAuth, requireVente, validate(updateClientSchema), ctrl.update);
router.delete('/:id', requireAuth, requireVente, ctrl.archive);

export default router;
