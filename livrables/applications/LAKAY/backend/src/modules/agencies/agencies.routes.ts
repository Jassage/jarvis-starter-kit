import { Router } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { requireAuth } from '../../middlewares/auth.middleware';
import { requireRole, requireAdmin } from '../../middlewares/rbac.middleware';
import { sendSuccess } from '../../utils/response';
import { uploadAvatar } from '../../middlewares/upload.middleware';
import { uploadToCloudinary } from '../../config/cloudinary';
import prisma from '../../config/database';
import { AppError } from '../../middlewares/errorHandler.middleware';

const router = Router();

// Lister les agences (public)
router.get('/', asyncHandler(async (req, res) => {
  const { page = '1', limit = '20', q } = req.query as Record<string, string>;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const where = q ? { name: { contains: q, mode: 'insensitive' as const }, isActive: true } : { isActive: true };

  const [agencies, total] = await Promise.all([
    prisma.agency.findMany({
      where,
      select: {
        id: true, name: true, logo: true, description: true,
        isVerified: true, phone: true, email: true,
        _count: { select: { listings: true, members: true } },
      },
      skip,
      take: parseInt(limit),
    }),
    prisma.agency.count({ where }),
  ]);

  sendSuccess(res, { agencies }, 'Agences', 200, { pagination: { page: parseInt(page), limit: parseInt(limit), total } });
}));

// Détail agence (public)
router.get('/:id', asyncHandler(async (req, res) => {
  const agency = await prisma.agency.findUnique({
    where: { id: req.params.id },
    include: {
      owner: { select: { id: true, firstName: true, lastName: true, avatar: true } },
      members: { include: { user: { select: { id: true, firstName: true, lastName: true, avatar: true } } } },
      listings: {
        where: { status: 'ACTIVE' },
        take: 12,
        select: {
          id: true, title: true, propertyType: true, listingType: true,
          price: true, currency: true, city: true,
          images: { where: { isPrimary: true }, take: 1 },
        },
      },
    },
  });
  if (!agency) { res.status(404).json({ success: false, message: 'Agence non trouvée' }); return; }
  sendSuccess(res, { agency });
}));

// Créer agence
router.post('/', requireAuth, requireRole('AGENCY'), asyncHandler(async (req, res) => {
  const existing = await prisma.agency.findUnique({ where: { ownerId: req.user!.id } });
  if (existing) throw new AppError('Vous avez déjà une agence', 409);

  const agency = await prisma.agency.create({
    data: { ...req.body, ownerId: req.user!.id },
  });
  sendSuccess(res, { agency }, 'Agence créée', 201);
}));

// Mettre à jour agence
router.patch('/:id', requireAuth, asyncHandler(async (req, res) => {
  const agency = await prisma.agency.findUnique({ where: { id: req.params.id } });
  if (!agency) throw new AppError('Agence non trouvée', 404);
  if (agency.ownerId !== req.user!.id && req.user!.role !== 'ADMIN' && req.user!.role !== 'SUPER_ADMIN') {
    throw new AppError('Permission refusée', 403);
  }
  const updated = await prisma.agency.update({ where: { id: req.params.id }, data: req.body });
  sendSuccess(res, { agency: updated }, 'Agence mise à jour');
}));

// Upload logo agence
router.post('/:id/logo', requireAuth, uploadAvatar.single('logo'), asyncHandler(async (req, res) => {
  if (!req.file) { res.status(400).json({ success: false, message: 'Fichier requis' }); return; }
  const agency = await prisma.agency.findUnique({ where: { id: req.params.id } });
  if (!agency || agency.ownerId !== req.user!.id) throw new AppError('Permission refusée', 403);

  const { url, publicId } = await uploadToCloudinary(req.file.buffer, 'agencies');
  await prisma.agency.update({ where: { id: req.params.id }, data: { logo: url, logoPublicId: publicId } });
  sendSuccess(res, { logoUrl: url }, 'Logo mis à jour');
}));

// Vérifier agence (admin)
router.patch('/:id/verify', requireAdmin, asyncHandler(async (req, res) => {
  const agency = await prisma.agency.update({
    where: { id: req.params.id },
    data: { isVerified: true },
  });
  sendSuccess(res, { agency }, 'Agence vérifiée');
}));

// Ajouter un agent à l'agence
router.post('/:id/agents', requireAuth, asyncHandler(async (req, res) => {
  const agency = await prisma.agency.findUnique({ where: { id: req.params.id } });
  if (!agency || agency.ownerId !== req.user!.id) throw new AppError('Permission refusée', 403);

  const member = await prisma.agencyMember.create({
    data: { agencyId: req.params.id, userId: req.body.userId },
    include: { user: { select: { id: true, firstName: true, lastName: true, avatar: true } } },
  });
  sendSuccess(res, { member }, 'Agent ajouté', 201);
}));

export default router;
