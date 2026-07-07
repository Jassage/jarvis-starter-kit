import { Router } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import * as ctrl from './mailbox.controller';
import { validate } from '../../middlewares/validate.middleware';
import { requireAuth } from '../../middlewares/auth.middleware';
import { createMailboxSchema, updateMailboxSchema, mailboxIdParamSchema, domainScopeParamSchema } from './mailbox.schemas';

const router = Router({ mergeParams: true });

router.use(requireAuth);

router.post('/', validate(createMailboxSchema), asyncHandler(ctrl.createMailbox));
router.get('/', validate(domainScopeParamSchema), asyncHandler(ctrl.listMailboxes));
router.get('/:id', validate(mailboxIdParamSchema), asyncHandler(ctrl.getMailbox));
router.patch('/:id', validate(updateMailboxSchema), asyncHandler(ctrl.updateMailbox));
router.delete('/:id', validate(mailboxIdParamSchema), asyncHandler(ctrl.deleteMailbox));

export default router;
