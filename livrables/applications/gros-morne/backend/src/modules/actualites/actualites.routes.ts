import { Router } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import * as ctrl from './actualites.controller';
import { validate } from '../../middlewares/validate.middleware';
import { requireAuth } from '../../middlewares/auth.middleware';
import { requireAdmin } from '../../middlewares/rbac.middleware';
import {
  listArticlesPubliqueSchema,
  listArticlesAdminSchema,
  getArticlePubliqueSchema,
  createArticleSchema,
  updateArticleSchema,
  deleteArticleSchema,
} from './actualites.schemas';

const router = Router();

router.get('/', validate(listArticlesPubliqueSchema), asyncHandler(ctrl.listPublique));
router.get('/admin', requireAuth, requireAdmin, validate(listArticlesAdminSchema), asyncHandler(ctrl.listAdmin));
// Déclarée après /admin pour ne pas se faire intercepter par le paramètre :id.
router.get('/:id', validate(getArticlePubliqueSchema), asyncHandler(ctrl.getByIdPublique));

router.post('/', requireAuth, requireAdmin, validate(createArticleSchema), asyncHandler(ctrl.create));
router.put('/:id', requireAuth, requireAdmin, validate(updateArticleSchema), asyncHandler(ctrl.update));
router.delete('/:id', requireAuth, requireAdmin, validate(deleteArticleSchema), asyncHandler(ctrl.remove));

export default router;
