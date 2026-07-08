import { Router } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import * as ctrl from './matchs.controller';
import { validate } from '../../middlewares/validate.middleware';
import { requireAuth } from '../../middlewares/auth.middleware';
import { createMatchSchema, updateMatchSchema, idParamSchema } from './matchs.schemas';

const router = Router();

router.use(requireAuth);

router.get('/', asyncHandler(ctrl.list));
router.get('/:id', validate(idParamSchema), asyncHandler(ctrl.getOne));
router.post('/', validate(createMatchSchema), asyncHandler(ctrl.create));
router.patch('/:id', validate(updateMatchSchema), asyncHandler(ctrl.update));
router.post('/:id/demarrer', validate(idParamSchema), asyncHandler(ctrl.demarrer));
router.post('/:id/terminer', validate(idParamSchema), asyncHandler(ctrl.terminer));

export default router;
