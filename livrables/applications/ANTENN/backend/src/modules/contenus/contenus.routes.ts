import { Router } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import * as ctrl from './contenus.controller';
import { validate } from '../../middlewares/validate.middleware';
import { requireAuth } from '../../middlewares/auth.middleware';
import { createContenuSchema, updateContenuSchema, idParamSchema } from './contenus.schemas';

const router = Router();

router.use(requireAuth);

router.get('/', asyncHandler(ctrl.list));
router.get('/:id', validate(idParamSchema), asyncHandler(ctrl.getOne));
router.post('/', validate(createContenuSchema), asyncHandler(ctrl.create));
router.patch('/:id', validate(updateContenuSchema), asyncHandler(ctrl.update));
router.delete('/:id', validate(idParamSchema), asyncHandler(ctrl.remove));

export default router;
