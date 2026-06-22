import { Response, NextFunction } from 'express'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { Role } from '@prisma/client'
import prisma from '../utils/prisma'
import { sendSuccess, sendError } from '../utils/response'
import { AuthRequest } from '../types'
import { audit } from '../utils/audit'

const userSchema = z.object({
  prenom: z.string().min(1),
  nom: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8),
  role: z.nativeEnum(Role),
  serviceId: z.string().uuid().optional()
})

export async function createUser(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = userSchema.parse(req.body)
    const exists = await prisma.user.findUnique({ where: { email: data.email } })
    if (exists) { sendError(res, 'Email déjà utilisé', 409); return }

    const password = await bcrypt.hash(data.password, 12)
    const user = await prisma.user.create({
      data: { ...data, password },
      select: { id: true, prenom: true, nom: true, email: true, role: true, serviceId: true, createdAt: true }
    })
    audit(req.user, 'CREATE', 'User', { recordId: user.id, label: `${user.prenom} ${user.nom} (${user.role})` })
    sendSuccess(res, user, 201)
  } catch (err) {
    next(err)
  }
}

export async function getUsers(_req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, prenom: true, nom: true, email: true, role: true, actif: true, serviceId: true },
      orderBy: { nom: 'asc' as const }
    })
    sendSuccess(res, users)
  } catch (err) {
    next(err)
  }
}

export async function updateUser(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = userSchema.partial().omit({ password: true }).parse(req.body)
    const user = await prisma.user.update({
      where: { id: String(req.params.id) },
      data,
      select: { id: true, prenom: true, nom: true, email: true, role: true, actif: true }
    })
    audit(req.user, 'UPDATE', 'User', { recordId: user.id, label: `${user.prenom} ${user.nom}` })
    sendSuccess(res, user)
  } catch (err) {
    next(err)
  }
}

export async function deleteUser(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    await prisma.user.update({ where: { id: String(req.params.id) }, data: { actif: false } })
    sendSuccess(res, { message: 'Utilisateur désactivé' })
  } catch (err) {
    next(err)
  }
}

export async function toggleActif(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const current = await prisma.user.findUnique({ where: { id: String(req.params.id) } })
    if (!current) { sendError(res, 'Utilisateur non trouvé', 404); return }
    const user = await prisma.user.update({
      where: { id: current.id },
      data: { actif: !current.actif },
      select: { id: true, prenom: true, nom: true, email: true, role: true, actif: true }
    })
    sendSuccess(res, user)
  } catch (err) {
    next(err)
  }
}
