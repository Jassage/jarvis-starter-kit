import { Router } from 'express';
import { z } from 'zod';
import { ReportReason } from '@prisma/client';
import { asyncHandler } from '../../utils/asyncHandler';
import { requireAuth } from '../../middlewares/auth.middleware';
import { validate } from '../../middlewares/validate.middleware';
import { sendSuccess } from '../../utils/response';
import prisma from '../../config/database';
import { AppError } from '../../middlewares/errorHandler.middleware';

const router = Router();

const createReportSchema = z.object({
  body: z.object({
    listingId: z.string().min(1),
    reason: z.nativeEnum(ReportReason),
    description: z.string().max(1000).optional(),
  }),
});

// Signaler une annonce (utilisateur connecté)
router.post('/', requireAuth, validate(createReportSchema), asyncHandler(async (req, res) => {
  const { listingId, reason, description } = req.body;

  const listing = await prisma.listing.findUnique({ where: { id: listingId }, select: { id: true, ownerId: true } });
  if (!listing) throw new AppError('Annonce non trouvée', 404);
  if (listing.ownerId === req.user!.id) throw new AppError('Vous ne pouvez pas signaler votre propre annonce', 400);

  // Anti-doublon : un seul signalement en cours par utilisateur et par annonce
  const existing = await prisma.report.findFirst({
    where: { listingId, reporterId: req.user!.id, status: { in: ['PENDING', 'UNDER_REVIEW'] } },
    select: { id: true },
  });
  if (existing) throw new AppError('Vous avez déjà signalé cette annonce, elle est en cours d\'examen.', 409);

  const report = await prisma.report.create({
    data: { listingId, reporterId: req.user!.id, reason, description },
  });

  sendSuccess(res, { report }, 'Signalement envoyé. Merci, notre équipe va l\'examiner.', 201);
}));

export default router;
