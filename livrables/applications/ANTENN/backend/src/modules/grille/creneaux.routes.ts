import { Router } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import * as ctrl from './creneaux.controller';
import { validate } from '../../middlewares/validate.middleware';
import { requireAuth } from '../../middlewares/auth.middleware';
import {
  listCreneauxSchema,
  createCreneauSchema,
  updateCreneauSchema,
  trousSchema,
  idParamSchema,
} from './creneaux.schemas';

const router = Router();

// Les deux rôles (ADMINISTRATEUR et OPERATEUR_REGIE) gèrent la grille au quotidien
router.use(requireAuth);

router.get('/', validate(listCreneauxSchema), asyncHandler(ctrl.list));
// Monté avant /:id pour ne pas être capturé comme un identifiant de créneau.
router.get('/trous', validate(trousSchema), asyncHandler(ctrl.trous));
router.get('/:id', validate(idParamSchema), asyncHandler(ctrl.getOne));
router.post('/', validate(createCreneauSchema), asyncHandler(ctrl.create));
router.patch('/:id', validate(updateCreneauSchema), asyncHandler(ctrl.update));
router.delete('/:id', validate(idParamSchema), asyncHandler(ctrl.remove));
router.post('/:id/dupliquer', validate(idParamSchema), asyncHandler(ctrl.dupliquer));
router.post('/:id/synchroniser', validate(idParamSchema), asyncHandler(ctrl.synchroniser));

export default router;
