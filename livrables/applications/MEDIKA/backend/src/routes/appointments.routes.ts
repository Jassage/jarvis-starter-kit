import { Router } from 'express'
import { requireAuth, requireRole } from '../middleware/auth'
import {
  createAppointment,
  getAppointments,
  getAppointment,
  updateAppointment,
  updateAppointmentStatut,
  getQueueByMedecin
} from '../controllers/appointments.controller'

const router = Router()

router.use(requireAuth)

router.get('/queue/:medecinId', getQueueByMedecin)
router.get('/', getAppointments)
router.get('/:id', getAppointment)
router.post('/', requireRole('ADMIN', 'ACCUEIL'), createAppointment)
router.put('/:id', requireRole('ADMIN', 'ACCUEIL', 'MEDECIN'), updateAppointment)
router.patch('/:id/statut', requireRole('ADMIN', 'ACCUEIL', 'MEDECIN', 'INFIRMIER'), updateAppointmentStatut)

export default router
