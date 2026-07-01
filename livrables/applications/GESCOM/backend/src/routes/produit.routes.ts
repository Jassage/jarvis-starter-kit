import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { requireStock } from '../middleware/rbac';
import { validate } from '../middleware/validate';
import { createProduitSchema, updateProduitSchema } from '../validation/produit.schemas';
import * as ctrl from '../controllers/produit.controller';

const router = Router();

router.get('/', requireAuth, ctrl.list);
router.get('/:id', requireAuth, ctrl.getOne);
router.post('/', requireAuth, requireStock, validate(createProduitSchema), ctrl.create);
router.put('/:id', requireAuth, requireStock, validate(updateProduitSchema), ctrl.update);
router.delete('/:id', requireAuth, requireStock, ctrl.archive);

export default router;
