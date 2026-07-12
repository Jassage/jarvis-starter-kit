import { Router } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { requireAuth } from '../../middlewares/auth.middleware';
import { sendSuccess } from '../../utils/response';
import prisma from '../../config/database';

const router = Router();
router.use(requireAuth);

// Lister les favoris
router.get('/', asyncHandler(async (req, res) => {
  const favorites = await prisma.favorite.findMany({
    where: { userId: req.user!.id },
    select: {
      id: true,
      savedPrice: true,
      createdAt: true,
      listing: {
        select: {
          id: true, title: true, propertyType: true, listingType: true,
          price: true, currency: true, city: true, department: true,
          bedrooms: true, area: true, status: true,
          images: { where: { isPrimary: true }, take: 1, select: { url: true } },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
  sendSuccess(res, { favorites });
}));

// Ajouter aux favoris (sauvegarde le prix actuel pour détecter les baisses)
router.post('/:listingId', asyncHandler(async (req, res) => {
  const listing = await prisma.listing.findUnique({
    where: { id: req.params.listingId },
    select: { id: true, price: true },
  });
  if (!listing) { res.status(404).json({ success: false, message: 'Annonce non trouvée' }); return; }

  const existing = await prisma.favorite.findUnique({
    where: { userId_listingId: { userId: req.user!.id, listingId: req.params.listingId } },
  });

  if (!existing) {
    await prisma.favorite.create({
      data: {
        userId: req.user!.id,
        listingId: req.params.listingId,
        savedPrice: listing.price,
      },
    });
    await prisma.listing.update({ where: { id: req.params.listingId }, data: { favoriteCount: { increment: 1 } } });
  }

  sendSuccess(res, null, 'Ajouté aux favoris', 201);
}));

// Retirer des favoris
router.delete('/:listingId', asyncHandler(async (req, res) => {
  const { count } = await prisma.favorite.deleteMany({
    where: { userId: req.user!.id, listingId: req.params.listingId },
  });
  // Ne décrémenter que si un favori a réellement été supprimé (sinon un appel répété
  // sur une annonce jamais/déjà retirée des favoris ferait passer favoriteCount en négatif)
  if (count > 0) {
    await prisma.listing.update({ where: { id: req.params.listingId }, data: { favoriteCount: { decrement: 1 } } });
  }
  sendSuccess(res, null, 'Retiré des favoris');
}));

export default router;
