import { Router } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import * as ctrl from './partenaires.controller';
import { validate } from '../../middlewares/validate.middleware';
import { requireAuth } from '../../middlewares/auth.middleware';
import { requireAdmin } from '../../middlewares/rbac.middleware';
import {
  listPartenairesPubliqueSchema,
  listPartenairesAdminSchema,
  createPartenaireSchema,
  updatePartenaireSchema,
  deletePartenaireSchema,
} from './partenaires.schemas';

const router = Router();

// Public : SponsorsSection (accueil) et le bandeau "Partenaires & soutiens" (à propos)
// filtrent par emplacement, ne voient jamais les brouillons/archives.
router.get('/', validate(listPartenairesPubliqueSchema), asyncHandler(ctrl.listPublique));

router.get('/admin', requireAuth, requireAdmin, validate(listPartenairesAdminSchema), asyncHandler(ctrl.listAdmin));

router.post('/', requireAuth, requireAdmin, validate(createPartenaireSchema), asyncHandler(ctrl.create));
router.put('/:id', requireAuth, requireAdmin, validate(updatePartenaireSchema), asyncHandler(ctrl.update));
router.delete('/:id', requireAuth, requireAdmin, validate(deletePartenaireSchema), asyncHandler(ctrl.remove));

export default router;
