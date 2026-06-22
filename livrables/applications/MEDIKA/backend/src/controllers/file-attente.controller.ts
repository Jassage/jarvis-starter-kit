import { Response, NextFunction } from 'express'
import { z } from 'zod'
import { StatutAttente, Prisma } from '@prisma/client'
import prisma from '../utils/prisma'
import { sendSuccess, sendError } from '../utils/response'
import { AuthRequest } from '../types'
import { broadcast } from '../utils/eventBus'

function todayBounds() {
  const d = new Date()
  const start = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0)
  const end   = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999)
  return { start, end }
}

const include = {
  patient: { select: { id: true, prenom: true, nom: true, numero: true, telephone: true } },
  medecin: { select: { id: true, prenom: true, nom: true, role: true } },
  appointment: { select: { id: true, dateHeure: true, motif: true, statut: true } },
}

export async function getFileAttente(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { start, end } = todayBounds()
    const where: Prisma.FileAttenteWhereInput = {
      dateFile: { gte: start, lte: end }
    }
    if (req.query.statut) where.statut = String(req.query.statut) as StatutAttente
    if (req.query.medecinId) where.medecinId = String(req.query.medecinId)

    const entries = await prisma.fileAttente.findMany({
      where,
      include,
      orderBy: { numero: 'asc' }
    })
    sendSuccess(res, entries)
  } catch (err) { next(err) }
}

export async function addToQueue(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = z.object({
      patientId: z.string().uuid(),
      appointmentId: z.string().uuid().optional(),
      medecinId: z.string().uuid().optional(),
      motif: z.string().optional(),
    }).parse(req.body)

    const { start, end } = todayBounds()
    const countToday = await prisma.fileAttente.count({
      where: { dateFile: { gte: start, lte: end } }
    })

    const alreadyInQueue = await prisma.fileAttente.findFirst({
      where: {
        patientId: data.patientId,
        dateFile: { gte: start, lte: end },
        statut: { in: ['EN_ATTENTE', 'EN_CONSULTATION'] }
      }
    })
    if (alreadyInQueue) {
      sendError(res, 'Ce patient est déjà dans la file d\'attente', 400)
      return
    }

    const entry = await prisma.fileAttente.create({
      data: { ...data, numero: countToday + 1 },
      include,
    })
    broadcast('fileattente')
    sendSuccess(res, entry, 201)
  } catch (err) { next(err) }
}

export async function callPatient(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const exists = await prisma.fileAttente.findUnique({ where: { id: String(req.params.id) } })
    if (!exists) { sendError(res, 'Entrée non trouvée', 404); return }
    if (exists.statut !== 'EN_ATTENTE') { sendError(res, 'Le patient n\'est pas en attente', 400); return }
    const entry = await prisma.fileAttente.update({
      where: { id: String(req.params.id) },
      data: { statut: 'EN_CONSULTATION', appelleA: new Date() },
      include,
    })
    broadcast('fileattente')
    sendSuccess(res, entry)
  } catch (err) { next(err) }
}

export async function terminerPatient(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const exists = await prisma.fileAttente.findUnique({ where: { id: String(req.params.id) } })
    if (!exists) { sendError(res, 'Entrée non trouvée', 404); return }
    const entry = await prisma.fileAttente.update({
      where: { id: String(req.params.id) },
      data: { statut: 'TERMINE', termineA: new Date() },
      include,
    })
    broadcast('fileattente')
    sendSuccess(res, entry)
  } catch (err) { next(err) }
}

export async function absentPatient(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const exists = await prisma.fileAttente.findUnique({ where: { id: String(req.params.id) } })
    if (!exists) { sendError(res, 'Entrée non trouvée', 404); return }
    const entry = await prisma.fileAttente.update({
      where: { id: String(req.params.id) },
      data: { statut: 'ABSENT' },
      include,
    })
    broadcast('fileattente')
    sendSuccess(res, entry)
  } catch (err) { next(err) }
}

export async function removeFromQueue(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const exists = await prisma.fileAttente.findUnique({ where: { id: String(req.params.id) } })
    if (!exists) { sendError(res, 'Entrée non trouvée', 404); return }
    await prisma.fileAttente.delete({ where: { id: String(req.params.id) } })
    broadcast('fileattente')
    sendSuccess(res, { message: 'Retiré de la file' })
  } catch (err) { next(err) }
}

export async function getStats(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { start, end } = todayBounds()
    const where = { dateFile: { gte: start, lte: end } }
    const [enAttente, enConsultation, termine, absent] = await Promise.all([
      prisma.fileAttente.count({ where: { ...where, statut: 'EN_ATTENTE' } }),
      prisma.fileAttente.count({ where: { ...where, statut: 'EN_CONSULTATION' } }),
      prisma.fileAttente.count({ where: { ...where, statut: 'TERMINE' } }),
      prisma.fileAttente.count({ where: { ...where, statut: 'ABSENT' } }),
    ])
    sendSuccess(res, { enAttente, enConsultation, termine, absent, total: enAttente + enConsultation + termine + absent })
  } catch (err) { next(err) }
}
