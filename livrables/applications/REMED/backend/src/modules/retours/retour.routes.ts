import { Router } from 'express';
import * as retourController from './retour.controller';
import { validate } from '../../middlewares/validate.middleware';
import { requireAuth } from '../../middlewares/auth.middleware';
import { requireStock } from '../../middlewares/rbac.middleware';
import { creerRetourSchema, listRetoursQuerySchema } from './retour.schemas';

const router = Router();

router.use(requireAuth);
router.get('/', validate(listRetoursQuerySchema), retourController.list);
router.post('/', requireStock, validate(creerRetourSchema), retourController.creer);

export default router;
