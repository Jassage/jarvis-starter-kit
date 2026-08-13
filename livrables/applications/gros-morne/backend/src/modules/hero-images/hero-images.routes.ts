import { Router } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import * as ctrl from './hero-images.controller';
import { validate } from '../../middlewares/validate.middleware';
import { requireAuth } from '../../middlewares/auth.middleware';
import { requireAdmin } from '../../middlewares/rbac.middleware';
import { getOneSchema, listAdminSchema, upsertSchema, deleteSchema } from './hero-images.schemas';

const router = Router();

// Public : chaque page publique va chercher sa propre image de fond, sans authentification.
router.get('/admin', requireAuth, requireAdmin, validate(listAdminSchema), asyncHandler(ctrl.listAdmin));
router.get('/:page', validate(getOneSchema), asyncHandler(ctrl.getOne));
router.put('/:page', requireAuth, requireAdmin, validate(upsertSchema), asyncHandler(ctrl.upsert));
router.delete('/:page', requireAuth, requireAdmin, validate(deleteSchema), asyncHandler(ctrl.remove));

export default router;
