import { Router } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import * as ctrl from './user.controller';
import { validate } from '../../middlewares/validate.middleware';
import { requireAuth } from '../../middlewares/auth.middleware';
import { requireSuperAdmin } from '../../middlewares/rbac.middleware';
import { createUserSchema, updateUserActifSchema } from './user.schemas';

const router = Router();

router.use(requireAuth, requireSuperAdmin);

router.post('/', validate(createUserSchema), asyncHandler(ctrl.createUser));
router.get('/', asyncHandler(ctrl.listUsers));
router.patch('/:id/actif', validate(updateUserActifSchema), asyncHandler(ctrl.updateUserActif));

export default router;
