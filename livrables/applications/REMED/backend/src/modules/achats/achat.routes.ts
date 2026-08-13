import { Router } from 'express';
import * as achatController from './achat.controller';
import { validate } from '../../middlewares/validate.middleware';
import { requireAuth } from '../../middlewares/auth.middleware';
import { requireStock } from '../../middlewares/rbac.middleware';
import {
  creerCommandeSchema,
  recevoirCommandeSchema,
  idParamSchema,
  listCommandesQuerySchema,
} from './achat.schemas';

const router = Router();

router.use(requireAuth);
router.get('/', validate(listCommandesQuerySchema), achatController.list);
router.get('/:id', validate(idParamSchema), achatController.getById);
router.post('/', requireStock, validate(creerCommandeSchema), achatController.creer);
router.post('/:id/envoyer', requireStock, validate(idParamSchema), achatController.envoyer);
router.post('/:id/annuler', requireStock, validate(idParamSchema), achatController.annuler);
router.post('/:id/recevoir', requireStock, validate(recevoirCommandeSchema), achatController.recevoir);

export default router;
