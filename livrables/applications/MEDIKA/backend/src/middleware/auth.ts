import { Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { AuthRequest, AuthPayload } from '../types'
import { sendError } from '../utils/response'
import { Role } from '@prisma/client'

export function requireAuth(req: AuthRequest, res: Response, next: NextFunction): void {
  const header = req.headers.authorization
  if (!header?.startsWith('Bearer ')) {
    sendError(res, 'Non authentifié', 401)
    return
  }
  const token = header.slice(7)
  const secret = process.env.JWT_SECRET
  if (!secret) throw new Error('JWT_SECRET manquant')

  try {
    req.user = jwt.verify(token, secret) as AuthPayload
    next()
  } catch {
    sendError(res, 'Token invalide ou expiré', 401)
  }
}

export function requireRole(...roles: Role[]) {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.role)) {
      sendError(res, 'Accès refusé', 403)
      return
    }
    next()
  }
}
