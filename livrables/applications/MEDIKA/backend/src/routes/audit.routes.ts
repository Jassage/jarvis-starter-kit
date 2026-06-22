import { Router } from 'express'
import { requireAuth, requireRole } from '../middleware/auth'
import prisma from '../utils/prisma'
import { sendSuccess } from '../utils/response'

const router = Router()
router.use(requireAuth, requireRole('ADMIN'))

router.get('/', async (req, res, next) => {
  try {
    const page     = Math.max(1, Number(req.query.page) || 1)
    const limit    = Math.min(Number(req.query.limit) || 50, 100)
    const skip     = (page - 1) * limit
    const resource = req.query.resource ? String(req.query.resource) : undefined
    const action   = req.query.action   ? String(req.query.action)   : undefined
    const userId   = req.query.userId   ? String(req.query.userId)   : undefined
    const from     = req.query.from     ? new Date(String(req.query.from)) : undefined
    const to       = req.query.to       ? new Date(String(req.query.to))   : undefined

    const where: any = {}
    if (resource) where.resource = resource
    if (action)   where.action   = action
    if (userId)   where.userId   = userId
    if (from || to) where.createdAt = { ...(from && { gte: from }), ...(to && { lte: to }) }

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' } }),
      prisma.auditLog.count({ where }),
    ])

    sendSuccess(res, { logs, total, page, totalPages: Math.ceil(total / limit) })
  } catch (err) { next(err) }
})

export default router
