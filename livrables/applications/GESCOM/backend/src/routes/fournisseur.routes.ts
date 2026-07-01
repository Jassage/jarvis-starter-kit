import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { requireStock } from '../middleware/rbac';
import { validate } from '../middleware/validate';
import { createFournisseurSchema, updateFournisseurSchema } from '../validation/achat.schemas';
import * as ctrl from '../controllers/fournisseur.controller';

const router = Router();

router.get('/', requireAuth, ctrl.list);
router.post('/', requireAuth, requireStock, validate(createFournisseurSchema), ctrl.create);
router.put('/:id', requireAuth, requireStock, validate(updateFournisseurSchema), ctrl.update);
router.delete('/:id', requireAuth, requireStock, ctrl.archive);

export default router;
