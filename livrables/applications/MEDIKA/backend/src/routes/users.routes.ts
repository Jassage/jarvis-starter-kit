import { Router } from 'express'
import { requireAuth, requireRole } from '../middleware/auth'
import { createUser, getUsers, updateUser, deleteUser, toggleActif } from '../controllers/users.controller'

const router = Router()

router.use(requireAuth, requireRole('ADMIN'))

router.get('/', getUsers)
router.post('/', createUser)
router.put('/:id', updateUser)
router.patch('/:id/actif', toggleActif)
router.delete('/:id', deleteUser)

export default router
