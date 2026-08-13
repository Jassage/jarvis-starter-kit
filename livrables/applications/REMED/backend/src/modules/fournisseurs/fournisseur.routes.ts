import { Router } from 'express';
import * as fournisseurController from './fournisseur.controller';
import { validate } from '../../middlewares/validate.middleware';
import { requireAuth } from '../../middlewares/auth.middleware';
import { requireStock } from '../../middlewares/rbac.middleware';
import { createFournisseurSchema, updateFournisseurSchema } from './fournisseur.schemas';

const router = Router();

router.use(requireAuth);
router.get('/', fournisseurController.list);
router.get('/:id', fournisseurController.getById);
router.post('/', requireStock, validate(createFournisseurSchema), fournisseurController.create);
router.patch('/:id', requireStock, validate(updateFournisseurSchema), fournisseurController.update);

export default router;
