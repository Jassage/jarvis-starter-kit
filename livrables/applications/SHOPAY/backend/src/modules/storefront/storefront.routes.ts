import { Router } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import * as ctrl from './storefront.controller';
import cartRoutes from '../cart/cart.routes';
import orderPublicRoutes from '../orders/orders.public.routes';

const router = Router({ mergeParams: true });

router.get('/:slug', asyncHandler(ctrl.getBoutique));
router.get('/:slug/products', asyncHandler(ctrl.listProducts));
router.get('/:slug/products/:productSlug', asyncHandler(ctrl.getProduct));
router.get('/:slug/categories', asyncHandler(ctrl.listCategories));

router.use('/:slug/cart', cartRoutes);
router.use('/:slug', orderPublicRoutes);

export default router;
