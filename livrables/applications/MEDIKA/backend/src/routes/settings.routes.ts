import { Router } from 'express'
import { requireAuth, requireRole } from '../middleware/auth'
import prisma from '../utils/prisma'
import { sendSuccess, sendError } from '../utils/response'

const router = Router()
router.use(requireAuth)

router.get('/hopital', async (_req, res, next) => {
  try {
    const config = await (prisma as any).hopitalConfig.upsert({
      where:  { id: 'singleton' },
      update: {},
      create: { id: 'singleton', nom: 'CLINIQUE MEDIKA' },
    })
    sendSuccess(res, config)
  } catch (err) { next(err) }
})

router.put('/hopital', requireRole('ADMIN'), async (req, res, next) => {
  try {
    const { nom, adresse, telephone, email, siteWeb } = req.body
    if (!nom?.trim()) { sendError(res, 'Le nom est requis', 400); return }
    const config = await (prisma as any).hopitalConfig.upsert({
      where:  { id: 'singleton' },
      update: { nom: nom.trim(), adresse: adresse?.trim() || null, telephone: telephone?.trim() || null, email: email?.trim() || null, siteWeb: siteWeb?.trim() || null },
      create: { id: 'singleton', nom: nom.trim(), adresse: adresse?.trim() || null, telephone: telephone?.trim() || null, email: email?.trim() || null, siteWeb: siteWeb?.trim() || null },
    })
    sendSuccess(res, config)
  } catch (err) { next(err) }
})

export default router
