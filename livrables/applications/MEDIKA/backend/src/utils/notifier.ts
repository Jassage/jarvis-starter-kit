import webpush from 'web-push'
import { Prisma } from '@prisma/client'
import prisma from './prisma'
import { broadcastTo } from './eventBus'

if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(
    process.env.VAPID_EMAIL || 'mailto:admin@medika.ht',
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY,
  )
}

export async function notify(
  userId: string,
  type: string,
  title: string,
  body: string,
  data?: Record<string, unknown>,
) {
  // 1. Persiste en base
  await prisma.notification.create({
    data: { userId, type, title, body, ...(data ? { data: data as Prisma.InputJsonValue } : {}) },
  })

  // 2. SSE temps réel vers cet utilisateur
  broadcastTo(userId, 'notifications', { notifType: type })

  // 3. Push navigateur (best-effort, ne bloque pas la réponse)
  sendPush(userId, title, body, data).catch(() => {})
}

async function sendPush(userId: string, title: string, body: string, data?: Record<string, unknown>) {
  if (!process.env.VAPID_PUBLIC_KEY) return

  const subs = await prisma.pushSubscription.findMany({ where: { userId } })
  const payload = JSON.stringify({ title, body, data, icon: '/icon-192.png', badge: '/icon-192.png' })

  await Promise.allSettled(
    subs.map(async (sub) => {
      try {
        await webpush.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          payload,
        )
      } catch (err: any) {
        // Subscription expirée ou invalide → on la supprime
        if (err.statusCode === 410 || err.statusCode === 404) {
          await prisma.pushSubscription.delete({ where: { id: sub.id } }).catch(() => {})
        }
      }
    }),
  )
}
