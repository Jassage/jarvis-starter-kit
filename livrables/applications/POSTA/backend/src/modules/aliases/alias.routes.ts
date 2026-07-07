import { Router } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import * as ctrl from './alias.controller';
import { validate } from '../../middlewares/validate.middleware';
import { requireAuth } from '../../middlewares/auth.middleware';
import { createAliasSchema, updateAliasSchema, aliasIdParamSchema, domainScopeParamSchema } from './alias.schemas';

const router = Router({ mergeParams: true });

router.use(requireAuth);

router.post('/', validate(createAliasSchema), asyncHandler(ctrl.createAlias));
router.get('/', validate(domainScopeParamSchema), asyncHandler(ctrl.listAliases));
router.get('/:id', validate(aliasIdParamSchema), asyncHandler(ctrl.getAlias));
router.patch('/:id', validate(updateAliasSchema), asyncHandler(ctrl.updateAlias));
router.delete('/:id', validate(aliasIdParamSchema), asyncHandler(ctrl.deleteAlias));

export default router;
