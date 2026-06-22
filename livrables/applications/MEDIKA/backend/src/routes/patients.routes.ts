import { Router } from 'express'
import { requireAuth, requireRole } from '../middleware/auth'
import {
  createPatient,
  getPatients,
  getPatient,
  updatePatient,
  toggleActifPatient,
  searchPatients
} from '../controllers/patients.controller'

const router = Router()

router.use(requireAuth)

router.get('/search', searchPatients)
router.get('/', getPatients)
router.get('/:id', getPatient)
router.post('/', requireRole('ADMIN', 'ACCUEIL'), createPatient)
router.put('/:id', requireRole('ADMIN', 'ACCUEIL', 'MEDECIN'), updatePatient)
router.patch('/:id/actif', requireRole('ADMIN'), toggleActifPatient)

export default router
