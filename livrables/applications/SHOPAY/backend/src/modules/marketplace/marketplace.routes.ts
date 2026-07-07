import { Router } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import * as ctrl from './marketplace.controller';

const router = Router();

router.get('/products', asyncHandler(ctrl.listProducts));
router.get('/boutiques', asyncHandler(ctrl.listBoutiques));

export default router;
