import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../../config/database';
import { requireAuth } from '../../middlewares/auth.middleware';
import { sendSuccess, sendError } from '../../utils/response';

const router = Router();

const createVisitSchema = z.object({
  listingId: z.string().uuid(),
  proposedDate: z.string().datetime(),
  message: z.string().max(500).optional(),
});

/**
 * @swagger
 * /api/visits:
 *   post:
 *     summary: Request a property visit
 *     tags: [Visits]
 *     security: [{ bearerAuth: [] }]
 */
router.post('/', requireAuth, async (req: Request & { user?: { id: string } }, res: Response) => {
  const parsed = createVisitSchema.safeParse(req.body);
  if (!parsed.success) return sendError(res, 'Données invalides', 422, [parsed.error.flatten()] as unknown[]);

  const listing = await prisma.listing.findFirst({
    where: { id: parsed.data.listingId, status: 'ACTIVE' },
    select: { id: true, ownerId: true, title: true },
  });
  if (!listing) return sendError(res, 'Annonce introuvable', 404);
  if (listing.ownerId === req.user!.id) return sendError(res, 'Vous ne pouvez pas demander une visite pour votre propre bien', 400);

  const visit = await prisma.visitRequest.create({
    data: {
      listingId: parsed.data.listingId,
      requesterId: req.user!.id,
      proposedDate: new Date(parsed.data.proposedDate),
      message: parsed.data.message,
    },
  });

  return sendSuccess(res, { visit }, 'Demande de visite envoyée', 201);
});

/**
 * @swagger
 * /api/visits/my:
 *   get:
 *     summary: Get my visit requests
 *     tags: [Visits]
 *     security: [{ bearerAuth: [] }]
 */
router.get('/my', requireAuth, async (req: Request & { user?: { id: string } }, res: Response) => {
  const visits = await prisma.visitRequest.findMany({
    where: { requesterId: req.user!.id },
    include: {
      listing: {
        select: { id: true, title: true, city: true, images: { take: 1, select: { url: true } } },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return sendSuccess(res, { visits }, 'Demandes récupérées');
});

/**
 * @swagger
 * /api/visits/received:
 *   get:
 *     summary: Get visit requests for my listings
 *     tags: [Visits]
 *     security: [{ bearerAuth: [] }]
 */
router.get('/received', requireAuth, async (req: Request & { user?: { id: string } }, res: Response) => {
  const visits = await prisma.visitRequest.findMany({
    where: { listing: { ownerId: req.user!.id } },
    include: {
      requester: { select: { id: true, firstName: true, lastName: true, phone: true, email: true } },
      listing: { select: { id: true, title: true } },
    },
    orderBy: { proposedDate: 'asc' },
  });

  return sendSuccess(res, { visits }, 'Visites reçues');
});

/**
 * @swagger
 * /api/visits/{id}/respond:
 *   patch:
 *     summary: Respond to a visit request
 *     tags: [Visits]
 *     security: [{ bearerAuth: [] }]
 */
router.patch('/:id/respond', requireAuth, async (req: Request & { user?: { id: string } }, res: Response) => {
  const schema = z.object({ status: z.enum(['CONFIRMED', 'CANCELLED']), ownerNote: z.string().max(300).optional() });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return sendError(res, 'Données invalides', 422);

  const visit = await prisma.visitRequest.findFirst({
    where: { id: req.params.id, listing: { ownerId: req.user!.id } },
  });
  if (!visit) return sendError(res, 'Demande introuvable', 404);

  const updated = await prisma.visitRequest.update({
    where: { id: req.params.id },
    data: { status: parsed.data.status as never, ownerNote: parsed.data.ownerNote },
  });

  return sendSuccess(res, { visit: updated }, 'Réponse envoyée');
});

export default router;
