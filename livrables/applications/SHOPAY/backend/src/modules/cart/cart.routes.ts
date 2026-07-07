import { Router } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import * as ctrl from './cart.controller';

const router = Router({ mergeParams: true });

router.get('/', asyncHandler(ctrl.getCart));
router.post('/items', asyncHandler(ctrl.addItem));
router.patch('/items/:itemId', asyncHandler(ctrl.updateItem));
router.delete('/items/:itemId', asyncHandler(ctrl.removeItem));

export default router;
