import { Router } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import * as ctrl from './temoignages.controller';
import { validate } from '../../middlewares/validate.middleware';
import { requireAuth } from '../../middlewares/auth.middleware';
import { requireAdmin } from '../../middlewares/rbac.middleware';
import {
  listTemoignagesPubliqueSchema,
  listTemoignagesAdminSchema,
  createTemoignageSchema,
  updateTemoignageSchema,
  deleteTemoignageSchema,
} from './temoignages.schemas';

const router = Router();

// Public : l'accueil ne voit jamais les brouillons/archives.
router.get('/', validate(listTemoignagesPubliqueSchema), asyncHandler(ctrl.listPublique));

router.get('/admin', requireAuth, requireAdmin, validate(listTemoignagesAdminSchema), asyncHandler(ctrl.listAdmin));

router.post('/', requireAuth, requireAdmin, validate(createTemoignageSchema), asyncHandler(ctrl.create));
router.put('/:id', requireAuth, requireAdmin, validate(updateTemoignageSchema), asyncHandler(ctrl.update));
router.delete('/:id', requireAuth, requireAdmin, validate(deleteTemoignageSchema), asyncHandler(ctrl.remove));

export default router;
