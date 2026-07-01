import { Router } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { requireAuth } from '../../middlewares/auth.middleware';
import { sendSuccess } from '../../utils/response';
import prisma from '../../config/database';

const router = Router();
router.use(requireAuth);

router.get('/', asyncHandler(async (req, res) => {
  const { page = '1', limit = '20' } = req.query as Record<string, string>;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [notifications, total, unreadCount] = await Promise.all([
    prisma.notification.findMany({
      where: { userId: req.user!.id },
      orderBy: { createdAt: 'desc' },
      skip,
      take: parseInt(limit),
    }),
    prisma.notification.count({ where: { userId: req.user!.id } }),
    prisma.notification.count({ where: { userId: req.user!.id, isRead: false } }),
  ]);

  sendSuccess(res, { notifications, unreadCount }, 'Notifications', 200, {
    pagination: { page: parseInt(page), limit: parseInt(limit), total },
  });
}));

router.patch('/:id/read', asyncHandler(async (req, res) => {
  await prisma.notification.updateMany({
    where: { id: req.params.id, userId: req.user!.id },
    data: { isRead: true },
  });
  sendSuccess(res, null, 'Notification marquée comme lue');
}));

router.patch('/read-all', asyncHandler(async (req, res) => {
  await prisma.notification.updateMany({
    where: { userId: req.user!.id, isRead: false },
    data: { isRead: true },
  });
  sendSuccess(res, null, 'Toutes les notifications marquées comme lues');
}));

router.delete('/:id', asyncHandler(async (req, res) => {
  await prisma.notification.deleteMany({
    where: { id: req.params.id, userId: req.user!.id },
  });
  sendSuccess(res, null, 'Notification supprimée');
}));

export default router;
