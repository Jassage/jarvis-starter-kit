import { Router, Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import { addClient, removeClient } from '../utils/eventBus'
import { AuthPayload } from '../types'

const router = Router()

router.get('/', (req: Request, res: Response) => {
  const token = req.query.token as string | undefined
  if (!token) { res.status(401).json({ message: 'Non authentifié' }); return }

  let userId: string | undefined
  try {
    const secret = process.env.JWT_SECRET
    if (!secret) throw new Error('JWT_SECRET manquant')
    const payload = jwt.verify(token, secret) as AuthPayload
    userId = payload.userId
  } catch {
    res.status(401).json({ message: 'Token invalide' }); return
  }

  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Cache-Control', 'no-cache')
  res.setHeader('Connection', 'keep-alive')
  res.setHeader('X-Accel-Buffering', 'no')
  res.flushHeaders()

  res.write(`data: ${JSON.stringify({ resource: 'connected', ts: Date.now() })}\n\n`)

  addClient(res, userId)

  const heartbeat = setInterval(() => {
    try { res.write(': ping\n\n') } catch { clearInterval(heartbeat) }
  }, 25000)

  req.on('close', () => {
    clearInterval(heartbeat)
    removeClient(res, userId)
  })
})

export default router
