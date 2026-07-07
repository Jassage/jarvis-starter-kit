import { Router } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { requireAuth } from '../../middlewares/auth.middleware';
import { requireMerchant } from '../../middlewares/rbac.middleware';
import { resolveBoutique } from '../../middlewares/tenant.middleware';
import { validate } from '../../middlewares/validate.middleware';
import { uploadImage } from '../../middlewares/upload.middleware';
import { createProductSchema, updateProductSchema } from './products.schemas';
import * as ctrl from './products.controller';

const router = Router();
router.use(requireAuth, requireMerchant, resolveBoutique);

router.get('/', asyncHandler(ctrl.list));
router.post('/', validate(createProductSchema), asyncHandler(ctrl.create));
router.get('/:id', asyncHandler(ctrl.getOne));
router.patch('/:id', validate(updateProductSchema), asyncHandler(ctrl.update));
router.delete('/:id', asyncHandler(ctrl.remove));
router.post('/:id/images', uploadImage.single('image'), asyncHandler(ctrl.uploadImage));
router.delete('/:id/images/:imageId', asyncHandler(ctrl.removeImage));

export default router;
