import { Router } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import * as ctrl from './tourisme.controller';
import { validate } from '../../middlewares/validate.middleware';
import { requireAuth } from '../../middlewares/auth.middleware';
import { requireAdmin } from '../../middlewares/rbac.middleware';
import {
  listTourismePubliqueSchema,
  listTourismeAdminSchema,
  createTourismePlaceSchema,
  updateTourismePlaceSchema,
  deleteTourismePlaceSchema,
} from './tourisme.schemas';

const router = Router();

// Public : la page /tourisme ne voit jamais les brouillons/archives.
router.get('/', validate(listTourismePubliqueSchema), asyncHandler(ctrl.listPublique));

// Admin : toutes les fiches quel que soit leur statut de publication.
router.get('/admin', requireAuth, requireAdmin, validate(listTourismeAdminSchema), asyncHandler(ctrl.listAdmin));

router.post('/', requireAuth, requireAdmin, validate(createTourismePlaceSchema), asyncHandler(ctrl.create));
router.put('/:id', requireAuth, requireAdmin, validate(updateTourismePlaceSchema), asyncHandler(ctrl.update));
router.delete('/:id', requireAuth, requireAdmin, validate(deleteTourismePlaceSchema), asyncHandler(ctrl.remove));

export default router;
