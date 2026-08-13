import { Router } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import * as ctrl from './documents.controller';
import { validate } from '../../middlewares/validate.middleware';
import { requireAuth } from '../../middlewares/auth.middleware';
import { requireAdmin } from '../../middlewares/rbac.middleware';
import {
  listDocumentsPubliqueSchema,
  listDocumentsAdminSchema,
  createDocumentSchema,
  updateDocumentSchema,
  deleteDocumentSchema,
} from './documents.schemas';

const router = Router();

// Public : page /documents, ne voit jamais les brouillons/archives.
router.get('/', validate(listDocumentsPubliqueSchema), asyncHandler(ctrl.listPublique));

router.get('/admin', requireAuth, requireAdmin, validate(listDocumentsAdminSchema), asyncHandler(ctrl.listAdmin));

router.post('/', requireAuth, requireAdmin, validate(createDocumentSchema), asyncHandler(ctrl.create));
router.put('/:id', requireAuth, requireAdmin, validate(updateDocumentSchema), asyncHandler(ctrl.update));
router.delete('/:id', requireAuth, requireAdmin, validate(deleteDocumentSchema), asyncHandler(ctrl.remove));

export default router;
