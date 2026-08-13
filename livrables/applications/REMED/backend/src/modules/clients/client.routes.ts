import { Router } from 'express';
import * as clientController from './client.controller';
import { validate } from '../../middlewares/validate.middleware';
import { requireAuth } from '../../middlewares/auth.middleware';
import { requireVente } from '../../middlewares/rbac.middleware';
import { createClientSchema, updateClientSchema, listClientsQuerySchema } from './client.schemas';

const router = Router();

router.use(requireAuth);
router.get('/', validate(listClientsQuerySchema), clientController.list);
router.get('/:id', clientController.getById);
router.post('/', requireVente, validate(createClientSchema), clientController.create);
router.patch('/:id', requireVente, validate(updateClientSchema), clientController.update);

export default router;
