import { Router } from 'express';
import * as depenseController from './depense.controller';
import { validate } from '../../middlewares/validate.middleware';
import { requireAuth } from '../../middlewares/auth.middleware';
import { requireGestionCatalogue } from '../../middlewares/rbac.middleware';
import { creerDepenseSchema, listDepensesQuerySchema } from './depense.schemas';

const router = Router();

router.use(requireAuth);
router.use(requireGestionCatalogue); // dépenses : donnée financière, réservée aux rôles de gestion
router.get('/', validate(listDepensesQuerySchema), depenseController.list);
router.post('/', validate(creerDepenseSchema), depenseController.creer);

export default router;
