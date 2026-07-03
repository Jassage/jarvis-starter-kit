import { Router } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { requireAuth } from '../../middlewares/auth.middleware';
import { sendSuccess } from '../../utils/response';
import prisma from '../../config/database';
import { AppError } from '../../middlewares/errorHandler.middleware';
import { z } from 'zod';
import { validate } from '../../middlewares/validate.middleware';

const createReviewSchema = z.object({
  params: z.object({ listingId: z.string() }),
  body: z.object({
    rating: z.coerce.number().int().min(1).max(5),
    comment: z.string().max(1000).optional(),
  }),
});

const router = Router();

// Avis d'une annonce (public)
router.get('/listing/:listingId', asyncHandler(async (req, res) => {
  const reviews = await prisma.review.findMany({
    where: { listingId: req.params.listingId },
    include: { user: { select: { id: true, firstName: true, lastName: true, avatar: true } } },
    orderBy: { createdAt: 'desc' },
  });

  const avgRating = reviews.length
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0;

  sendSuccess(res, { reviews, avgRating: Math.round(avgRating * 10) / 10, total: reviews.length });
}));

// Poster un avis
router.post('/listing/:listingId', requireAuth, validate(createReviewSchema), asyncHandler(async (req, res) => {
  const listing = await prisma.listing.findUnique({ where: { id: req.params.listingId } });
  if (!listing) throw new AppError('Annonce non trouvée', 404);
  if (listing.ownerId === req.user!.id) throw new AppError('Vous ne pouvez pas évaluer votre propre annonce', 400);

  // Preuve d'interaction requise : une visite confirmée ou effectuée sur ce bien
  const visit = await prisma.visitRequest.findFirst({
    where: {
      listingId: req.params.listingId,
      requesterId: req.user!.id,
      status: { in: ['CONFIRMED', 'COMPLETED'] },
    },
    select: { id: true },
  });
  if (!visit) {
    throw new AppError('Vous devez avoir une visite confirmée sur ce bien pour laisser un avis', 403);
  }

  const review = await prisma.review.upsert({
    where: { listingId_userId: { listingId: req.params.listingId, userId: req.user!.id } },
    create: { listingId: req.params.listingId, userId: req.user!.id, isVerified: true, ...req.body },
    update: req.body,
    include: { user: { select: { id: true, firstName: true, lastName: true, avatar: true } } },
  });

  sendSuccess(res, { review }, 'Avis publié', 201);
}));

// Supprimer son avis
router.delete('/:id', requireAuth, asyncHandler(async (req, res) => {
  await prisma.review.deleteMany({
    where: { id: req.params.id, userId: req.user!.id },
  });
  sendSuccess(res, null, 'Avis supprimé');
}));

export default router;
