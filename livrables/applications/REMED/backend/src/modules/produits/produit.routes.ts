import { Router } from 'express';
import * as produitController from './produit.controller';
import { validate } from '../../middlewares/validate.middleware';
import { requireAuth } from '../../middlewares/auth.middleware';
import { requireGestionCatalogue } from '../../middlewares/rbac.middleware';
import { createProduitSchema, updateProduitSchema, listProduitsQuerySchema } from './produit.schemas';

const router = Router();

router.use(requireAuth);
router.get('/', validate(listProduitsQuerySchema), produitController.list);
router.get('/:id', produitController.getById);
router.post('/', requireGestionCatalogue, validate(createProduitSchema), produitController.create);
router.patch('/:id', requireGestionCatalogue, validate(updateProduitSchema), produitController.update);

export default router;
