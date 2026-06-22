import { Router } from 'express'
import { requireAuth, requireRole } from '../middleware/auth'
import { getTarifs, createTarif, updateTarif, deactivateTarif } from '../controllers/tarifs.controller'

const router = Router()

router.use(requireAuth)
router.get('/',     getTarifs)
router.post('/',    requireRole('ADMIN'), createTarif)
router.patch('/:id', requireRole('ADMIN'), updateTarif)
router.delete('/:id', requireRole('ADMIN'), deactivateTarif)

export default router
