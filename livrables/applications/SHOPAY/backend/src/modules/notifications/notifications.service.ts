import prisma from '../../config/database';

export async function listNotifications(boutiqueId: string) {
  return prisma.notification.findMany({
    where: { boutiqueId },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });
}

export async function markAsRead(boutiqueId: string, notificationId: string) {
  return prisma.notification.updateMany({
    where: { id: notificationId, boutiqueId },
    data: { isRead: true },
  });
}
