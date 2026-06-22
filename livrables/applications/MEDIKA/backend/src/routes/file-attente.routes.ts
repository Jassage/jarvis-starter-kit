import { Router } from 'express'
import { requireAuth, requireRole } from '../middleware/auth'
import {
  getFileAttente,
  addToQueue,
  callPatient,
  terminerPatient,
  absentPatient,
  removeFromQueue,
  getStats,
} from '../controllers/file-attente.controller'

const router = Router()
router.use(requireAuth)

router.get('/', getFileAttente)
router.get('/stats', getStats)
router.post('/', requireRole('ADMIN', 'ACCUEIL', 'MEDECIN', 'INFIRMIER'), addToQueue)
router.patch('/:id/appeler', requireRole('ADMIN', 'MEDECIN', 'INFIRMIER'), callPatient)
router.patch('/:id/terminer', requireRole('ADMIN', 'MEDECIN', 'INFIRMIER'), terminerPatient)
router.patch('/:id/absent', requireRole('ADMIN', 'MEDECIN', 'INFIRMIER', 'ACCUEIL'), absentPatient)
router.delete('/:id', requireRole('ADMIN', 'ACCUEIL'), removeFromQueue)

export default router
