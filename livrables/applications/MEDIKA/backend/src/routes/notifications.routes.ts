import { Router } from 'express'
import { z } from 'zod'
import { requireAuth } from '../middleware/auth'
import prisma from '../utils/prisma'
import { sendSuccess, sendError } from '../utils/response'
import { AuthRequest } from '../types'

const router = Router()
router.use(requireAuth)

// GET /notifications — dernières 30 notifications de l'utilisateur
router.get('/', async (req: AuthRequest, res, next) => {
  try {
    const userId = req.user!.userId
    const [notifications, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 30,
      }),
      prisma.notification.count({ where: { userId, read: false } }),
    ])
    sendSuccess(res, { notifications, unreadCount })
  } catch (err) { next(err) }
})

// PATCH /notifications/:id/read
router.patch('/:id/read', async (req: AuthRequest, res, next) => {
  try {
    const notif = await prisma.notification.findUnique({ where: { id: String(req.params.id) } })
    if (!notif || notif.userId !== req.user!.userId) { sendError(res, 'Notification introuvable', 404); return }
    await prisma.notification.update({ where: { id: String(req.params.id) }, data: { read: true } })
    sendSuccess(res, { ok: true })
  } catch (err) { next(err) }
})

// PATCH /notifications/read-all
router.patch('/read-all', async (req: AuthRequest, res, next) => {
  try {
    await prisma.notification.updateMany({
      where: { userId: req.user!.userId, read: false },
      data: { read: true },
    })
    sendSuccess(res, { ok: true })
  } catch (err) { next(err) }
})

// POST /notifications/push-subscribe — enregistre une souscription push
router.post('/push-subscribe', async (req: AuthRequest, res, next) => {
  try {
    const { endpoint, p256dh, auth } = z.object({
      endpoint: z.string().url(),
      p256dh:   z.string(),
      auth:     z.string(),
    }).parse(req.body)

    await prisma.pushSubscription.upsert({
      where:  { endpoint },
      update: { userId: req.user!.userId, p256dh, auth },
      create: { userId: req.user!.userId, endpoint, p256dh, auth },
    })
    sendSuccess(res, { ok: true })
  } catch (err) { next(err) }
})

// DELETE /notifications/push-unsubscribe
router.delete('/push-unsubscribe', async (req: AuthRequest, res, next) => {
  try {
    const { endpoint } = z.object({ endpoint: z.string() }).parse(req.body)
    await prisma.pushSubscription.deleteMany({ where: { endpoint, userId: req.user!.userId } })
    sendSuccess(res, { ok: true })
  } catch (err) { next(err) }
})

// GET /notifications/vapid-public-key — clé publique VAPID pour le frontend
router.get('/vapid-public-key', (_req, res) => {
  res.json({ key: process.env.VAPID_PUBLIC_KEY || '' })
})

export default router
