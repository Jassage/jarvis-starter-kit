import { Router, Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import { addClient, removeClient } from '../utils/eventBus'

const router = Router()

router.get('/', (req: Request, res: Response) => {
  const token = req.query.token as string | undefined
  if (!token) { res.status(401).json({ message: 'Non authentifié' }); return }

  try {
    const secret = process.env.JWT_SECRET
    if (!secret) throw new Error('JWT_SECRET manquant')
    jwt.verify(token, secret)
  } catch {
    res.status(401).json({ message: 'Token invalide' }); return
  }

  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Cache-Control', 'no-cache')
  res.setHeader('Connection', 'keep-alive')
  res.setHeader('X-Accel-Buffering', 'no')
  res.flushHeaders()

  // Confirmation de connexion
  res.write(`data: ${JSON.stringify({ resource: 'connected', ts: Date.now() })}\n\n`)

  addClient(res)

  // Heartbeat toutes les 25s pour éviter les timeouts proxy
  const heartbeat = setInterval(() => {
    try { res.write(': ping\n\n') } catch { clearInterval(heartbeat) }
  }, 25000)

  req.on('close', () => {
    clearInterval(heartbeat)
    removeClient(res)
  })
})

export default router
