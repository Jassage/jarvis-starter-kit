import { Router } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import * as ctrl from './listings.controller';
import { requireAuth, optionalAuth } from '../../middlewares/auth.middleware';
import { requireAdmin } from '../../middlewares/rbac.middleware';
import { validate } from '../../middlewares/validate.middleware';
import { uploadImages as uploadImagesMiddleware } from '../../middlewares/upload.middleware';
import { uploadLimiter } from '../../middlewares/rateLimiter.middleware';
import { createListingSchema, updateListingSchema, listingIdSchema, reviewListingSchema } from './listings.schemas';

const router = Router();

// Lecture publique
router.get('/featured', asyncHandler(ctrl.getFeaturedListings));
router.get('/:id/similar', asyncHandler(ctrl.getSimilarListings));
router.get('/:id', optionalAuth, validate(listingIdSchema), asyncHandler(ctrl.getListing));

// Propriétaire authentifié
router.post('/', requireAuth, validate(createListingSchema), asyncHandler(ctrl.createListing));
router.get('/me/listings', requireAuth, asyncHandler(ctrl.getMyListings));
router.post('/:id/renew', requireAuth, validate(listingIdSchema), asyncHandler(ctrl.renewListing));
router.patch('/:id', requireAuth, validate(updateListingSchema), asyncHandler(ctrl.updateListing));
router.delete('/:id', requireAuth, validate(listingIdSchema), asyncHandler(ctrl.deleteListing));
router.post('/:id/submit', requireAuth, validate(listingIdSchema), asyncHandler(ctrl.submitForReview));

// Médias
router.post('/:id/images', requireAuth, uploadLimiter, uploadImagesMiddleware.array('images', 20), asyncHandler(ctrl.uploadImages));
router.delete('/:id/images/:imageId', requireAuth, asyncHandler(ctrl.deleteImage));

// Admin
router.get('/admin/pending', requireAuth, requireAdmin, asyncHandler(ctrl.getPendingListings));
router.post('/:id/review', requireAuth, requireAdmin, validate(reviewListingSchema), asyncHandler(ctrl.reviewListing));

export default router;
