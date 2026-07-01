import { Worker, Job } from 'bullmq';
import { prisma } from '../config/database';
import { getIO } from '../config/socket';
import { env } from '../config/env';

function redisConnection() {
  const url = new URL(env.REDIS_URL);
  return {
    host: url.hostname,
    port: Number(url.port) || 6379,
    password: url.password || undefined,
    tls: url.protocol === 'rediss:' ? {} : undefined,
    maxRetriesPerRequest: null as unknown as number,
  };
}

interface NotificationJob {
  userId: string;
  type: string;
  title: string;
  message: string;
  link?: string;
  data?: Record<string, unknown>;
}

export const notificationWorker = new Worker<NotificationJob>(
  'notifications',
  async (job: Job<NotificationJob>) => {
    const { userId, type, title, message, link, data } = job.data;

    const notification = await prisma.notification.create({
      data: {
        userId,
        type: type as never,
        title,
        message,
        link,
        data: data ? JSON.stringify(data) : undefined,
      },
    });

    // Push via Socket.IO if user is connected
    let io;
    try { io = getIO(); } catch { /* pas encore initialisé */ }
    if (io) {
      io.to(`user:${userId}`).emit('notification', {
        id: notification.id,
        type,
        title,
        message,
        link,
        createdAt: notification.createdAt,
      });
    }

    console.log(`[NotificationWorker] Notification sent to user ${userId} — type: ${type}`);
  },
  {
    connection: redisConnection(),
    concurrency: 10,
  }
);

notificationWorker.on('failed', (job, err) => {
  console.error(`[NotificationWorker] Job ${job?.id} failed:`, err.message);
});
