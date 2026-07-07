import prisma from '../../config/database';
import { NotificationType, Prisma } from '@prisma/client';

type Db = typeof prisma | Prisma.TransactionClient;

// Point d'entrée unique pour créer une notification marchand, appelable aussi bien avec le
// client Prisma normal qu'avec un client de transaction (tx) — les webhooks de paiement créent
// leur notification dans la même transaction que l'activation, pour ne jamais notifier un
// paiement qui serait finalement annulé par un rollback.
export async function createNotification(
  db: Db,
  input: { boutiqueId: string; type: NotificationType; title: string; message: string; data?: object }
) {
  return db.notification.create({
    data: {
      boutiqueId: input.boutiqueId,
      type: input.type,
      title: input.title,
      message: input.message,
      data: input.data,
    },
  });
}

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
