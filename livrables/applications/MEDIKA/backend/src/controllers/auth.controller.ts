import { Request, Response, NextFunction } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { z } from 'zod'
import prisma from '../utils/prisma'
import { sendSuccess, sendError } from '../utils/response'
import { AuthRequest } from '../types'
import { audit } from '../utils/audit'

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
})

export async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { email, password } = loginSchema.parse(req.body)

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user || !user.actif) {
      sendError(res, 'Email ou mot de passe incorrect', 401)
      return
    }

    const valid = await bcrypt.compare(password, user.password)
    if (!valid) {
      sendError(res, 'Email ou mot de passe incorrect', 401)
      return
    }

    const secret = process.env.JWT_SECRET
    if (!secret) throw new Error('JWT_SECRET manquant')

    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      secret,
      { expiresIn: 604800 }
    )

    const payload = { userId: user.id, email: user.email, role: user.role as any }
    audit(payload, 'LOGIN', 'Auth', { recordId: user.id, label: `${user.prenom} ${user.nom} (${user.role})` })
    sendSuccess(res, {
      token,
      user: { id: user.id, prenom: user.prenom, nom: user.nom, email: user.email, role: user.role }
    })
  } catch (err) {
    next(err)
  }
}

export async function updateMe(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { prenom, nom, currentPassword, newPassword } = req.body

    if (!prenom?.trim() || !nom?.trim()) {
      sendError(res, 'Prénom et nom sont requis', 400)
      return
    }

    const user = await prisma.user.findUnique({ where: { id: req.user!.userId } })
    if (!user) { sendError(res, 'Utilisateur non trouvé', 404); return }

    const data: { prenom: string; nom: string; password?: string } = {
      prenom: prenom.trim(),
      nom:    nom.trim(),
    }

    if (newPassword) {
      if (!currentPassword) { sendError(res, 'Mot de passe actuel requis', 400); return }
      const valid = await bcrypt.compare(currentPassword, user.password)
      if (!valid) { sendError(res, 'Mot de passe actuel incorrect', 400); return }
      if (newPassword.length < 6) { sendError(res, 'Le nouveau mot de passe doit faire au moins 6 caractères', 400); return }
      data.password = await bcrypt.hash(newPassword, 12)
    }

    const updated = await prisma.user.update({
      where:  { id: user.id },
      data,
      select: { id: true, prenom: true, nom: true, email: true, role: true },
    })
    sendSuccess(res, updated)
  } catch (err) {
    next(err)
  }
}

export async function me(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      select: { id: true, prenom: true, nom: true, email: true, role: true, serviceId: true }
    })
    if (!user) {
      sendError(res, 'Utilisateur non trouvé', 404)
      return
    }
    sendSuccess(res, user)
  } catch (err) {
    next(err)
  }
}
