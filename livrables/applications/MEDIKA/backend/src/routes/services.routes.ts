import { Router } from 'express'
import { requireAuth, requireRole } from '../middleware/auth'
import prisma from '../utils/prisma'
import { sendSuccess, sendError } from '../utils/response'

const router = Router()
router.use(requireAuth)

router.get('/', async (_req, res, next) => {
  try {
    const services = await prisma.service.findMany({ orderBy: { nom: 'asc' } })
    sendSuccess(res, services)
  } catch (err) { next(err) }
})

router.post('/', requireRole('ADMIN'), async (req, res, next) => {
  try {
    const { nom, description } = req.body
    if (!nom?.trim()) { sendError(res, 'Le nom est requis', 400); return }
    const service = await prisma.service.create({ data: { nom: nom.trim(), description: description?.trim() } })
    sendSuccess(res, service, 201)
  } catch (err) { next(err) }
})

router.put('/:id', requireRole('ADMIN'), async (req, res, next) => {
  try {
    const { nom, description } = req.body
    if (!nom?.trim()) { sendError(res, 'Le nom est requis', 400); return }
    const service = await prisma.service.update({
      where: { id: String(req.params.id) },
      data: { nom: nom.trim(), description: description?.trim() }
    })
    sendSuccess(res, service)
  } catch (err) { next(err) }
})

router.patch('/:id/actif', requireRole('ADMIN'), async (req, res, next) => {
  try {
    const current = await prisma.service.findUnique({ where: { id: String(req.params.id) } })
    if (!current) { sendError(res, 'Service non trouvé', 404); return }
    const service = await prisma.service.update({ where: { id: current.id }, data: { actif: !current.actif } })
    sendSuccess(res, service)
  } catch (err) { next(err) }
})

export default router
