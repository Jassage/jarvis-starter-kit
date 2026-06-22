import { Router } from 'express'
import { requireAuth, requireRole } from '../middleware/auth'
import {
  createFacture,
  getFactures,
  getFacture,
  addPaiement,
  annulerFacture,
  getImpayés
} from '../controllers/factures.controller'

const router = Router()

router.use(requireAuth)

router.get('/impayes', requireRole('ADMIN', 'CAISSIER'), getImpayés)
router.get('/', requireRole('ADMIN', 'CAISSIER', 'MEDECIN'), getFactures)
router.get('/:id', requireRole('ADMIN', 'CAISSIER', 'MEDECIN'), getFacture)
router.post('/', requireRole('ADMIN', 'CAISSIER', 'MEDECIN'), createFacture)
router.post('/:id/paiements', requireRole('ADMIN', 'CAISSIER'), addPaiement)
router.patch('/:id/annuler', requireRole('ADMIN', 'CAISSIER'), annulerFacture)

export default router
