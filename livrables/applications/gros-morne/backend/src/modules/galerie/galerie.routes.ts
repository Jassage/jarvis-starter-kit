import { Router } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import * as ctrl from './galerie.controller';
import { validate } from '../../middlewares/validate.middleware';
import { requireAuth } from '../../middlewares/auth.middleware';
import { requireAdmin } from '../../middlewares/rbac.middleware';
import {
  listAlbumsPubliqueSchema,
  listAlbumsAdminSchema,
  createAlbumSchema,
  updateAlbumSchema,
  deleteAlbumSchema,
} from './galerie.schemas';

const router = Router();

router.get('/', validate(listAlbumsPubliqueSchema), asyncHandler(ctrl.listPublique));
router.get('/admin', requireAuth, requireAdmin, validate(listAlbumsAdminSchema), asyncHandler(ctrl.listAdmin));

router.post('/', requireAuth, requireAdmin, validate(createAlbumSchema), asyncHandler(ctrl.create));
router.put('/:id', requireAuth, requireAdmin, validate(updateAlbumSchema), asyncHandler(ctrl.update));
router.delete('/:id', requireAuth, requireAdmin, validate(deleteAlbumSchema), asyncHandler(ctrl.remove));

export default router;
