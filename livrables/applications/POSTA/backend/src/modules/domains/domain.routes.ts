import { Router } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import * as ctrl from './domain.controller';
import { validate } from '../../middlewares/validate.middleware';
import { requireAuth } from '../../middlewares/auth.middleware';
import { createDomainSchema, domainIdParamSchema } from './domain.schemas';
import mailboxRoutes from '../mailboxes/mailbox.routes';
import aliasRoutes from '../aliases/alias.routes';

const router = Router();

router.use(requireAuth);

router.use('/:domainId/mailboxes', mailboxRoutes);
router.use('/:domainId/aliases', aliasRoutes);

router.post('/', validate(createDomainSchema), asyncHandler(ctrl.createDomain));
router.get('/', asyncHandler(ctrl.listDomains));
router.get('/:id', validate(domainIdParamSchema), asyncHandler(ctrl.getDomain));
router.post('/:id/verify', validate(domainIdParamSchema), asyncHandler(ctrl.verifyDomain));
router.delete('/:id', validate(domainIdParamSchema), asyncHandler(ctrl.deleteDomain));

export default router;
