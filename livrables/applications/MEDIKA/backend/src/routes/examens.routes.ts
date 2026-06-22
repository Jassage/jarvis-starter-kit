import { Router } from 'express'
import { requireAuth, requireRole } from '../middleware/auth'
import {
  createExamen,
  getExamens,
  getExamen,
  updateStatutExamen,
  saisirResultat,
  annulerExamen,
} from '../controllers/examens.controller'

const router = Router()

router.use(requireAuth)

router.get('/', getExamens)
router.get('/:id', getExamen)
router.post('/', requireRole('MEDECIN', 'ADMIN'), createExamen)
router.patch('/:id/statut', requireRole('MEDECIN', 'INFIRMIER', 'ADMIN'), updateStatutExamen)
router.patch('/:id/resultat', requireRole('MEDECIN', 'INFIRMIER', 'ADMIN'), saisirResultat)
router.patch('/:id/annuler', requireRole('MEDECIN', 'ADMIN'), annulerExamen)

export default router
