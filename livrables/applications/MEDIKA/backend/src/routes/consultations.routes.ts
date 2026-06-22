import { Router } from 'express'
import { requireAuth, requireRole } from '../middleware/auth'
import {
  createConsultation,
  getConsultations,
  getConsultation,
  updateConsultation,
  deleteConsultation,
  getConsultationsByPatient
} from '../controllers/consultations.controller'

const router = Router()

router.use(requireAuth)

router.get('/patient/:patientId', getConsultationsByPatient)
router.get('/', getConsultations)
router.get('/:id', getConsultation)
router.post('/', requireRole('MEDECIN', 'INFIRMIER', 'ADMIN'), createConsultation)
router.put('/:id', requireRole('MEDECIN', 'INFIRMIER', 'ADMIN'), updateConsultation)
router.delete('/:id', requireRole('ADMIN'), deleteConsultation)

export default router
