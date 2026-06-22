import { Router } from 'express'
import rateLimit from 'express-rate-limit'
import { login, me, updateMe } from '../controllers/auth.controller'
import { requireAuth } from '../middleware/auth'

const router = Router()

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Trop de tentatives de connexion. Réessayez dans 15 minutes.' },
})

router.post('/login', loginLimiter, login)
router.get('/me', requireAuth, me)
router.put('/me', requireAuth, updateMe)

export default router
