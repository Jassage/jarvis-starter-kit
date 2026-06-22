import { Response, NextFunction } from 'express'
import { z } from 'zod'
import { AppointmentStatut, Prisma } from '@prisma/client'
import prisma from '../utils/prisma'
import { sendSuccess, sendError } from '../utils/response'
import { AuthRequest } from '../types'

const appointmentSchema = z.object({
  patientId: z.string().uuid(),
  medecinId: z.string().uuid(),
  serviceId: z.string().uuid(),
  dateHeure: z.string().datetime(),
  motif: z.string().optional(),
  notes: z.string().optional()
})

const include = {
  patient: { select: { id: true, prenom: true, nom: true, numero: true, telephone: true } },
  medecin: { select: { id: true, prenom: true, nom: true, role: true } },
  service: true
}

export async function createAppointment(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = appointmentSchema.parse(req.body)
    const appointment = await prisma.appointment.create({
      data: { ...data, dateHeure: new Date(data.dateHeure) },
      include
    })
    sendSuccess(res, appointment, 201)
  } catch (err) {
    next(err)
  }
}

export async function getAppointments(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const where: Prisma.AppointmentWhereInput = {}

    if (req.query.date) {
      const [y, m, d] = String(req.query.date).split('-').map(Number)
      const start = new Date(y, m - 1, d, 0, 0, 0, 0)
      const end   = new Date(y, m - 1, d, 23, 59, 59, 999)
      where.dateHeure = { gte: start, lte: end }
    }
    if (req.query.patientId) where.patientId = String(req.query.patientId)
    if (req.query.medecinId) where.medecinId = String(req.query.medecinId)
    if (req.query.statut) where.statut = String(req.query.statut) as AppointmentStatut

    const appointments = await prisma.appointment.findMany({
      where,
      include,
      orderBy: { dateHeure: 'asc' }
    })
    sendSuccess(res, appointments)
  } catch (err) {
    next(err)
  }
}

export async function getAppointment(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const appointment = await prisma.appointment.findUnique({ where: { id: String(req.params.id) }, include })
    if (!appointment) { sendError(res, 'Rendez-vous non trouvé', 404); return }
    sendSuccess(res, appointment)
  } catch (err) {
    next(err)
  }
}

export async function updateAppointmentStatut(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { statut } = z.object({ statut: z.nativeEnum(AppointmentStatut) }).parse(req.body)
    const appointment = await prisma.appointment.update({
      where: { id: String(req.params.id) },
      data: { statut },
      include
    })
    sendSuccess(res, appointment)
  } catch (err) {
    next(err)
  }
}

export async function updateAppointment(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = appointmentSchema.partial().parse(req.body)
    const appointment = await prisma.appointment.update({
      where: { id: String(req.params.id) },
      data: { ...data, ...(data.dateHeure && { dateHeure: new Date(data.dateHeure) }) },
      include
    })
    sendSuccess(res, appointment)
  } catch (err) { next(err) }
}

export async function getQueueByMedecin(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const today = new Date()
    const start = new Date(today.setHours(0, 0, 0, 0))
    const end = new Date(today.setHours(23, 59, 59, 999))

    const queue = await prisma.appointment.findMany({
      where: {
        medecinId: String(req.params.medecinId),
        dateHeure: { gte: start, lte: end },
        statut: { in: ['PLANIFIE', 'EN_ATTENTE', 'EN_CONSULTATION'] as AppointmentStatut[] }
      },
      include,
      orderBy: { dateHeure: 'asc' }
    })
    sendSuccess(res, queue)
  } catch (err) {
    next(err)
  }
}
