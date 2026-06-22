import { Response, NextFunction } from 'express'
import { z } from 'zod'
import { Prisma } from '@prisma/client'
import prisma from '../utils/prisma'
import { sendSuccess, sendError } from '../utils/response'
import { AuthRequest } from '../types'
import { audit } from '../utils/audit'
import { broadcast } from '../utils/eventBus'

function todayBounds() {
  const d = new Date()
  return {
    start: new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0),
    end:   new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999),
  }
}

async function syncFileAttente(tx: Prisma.TransactionClient, patientId: string, newStatut: 'EN_CONSULTATION' | 'TERMINE') {
  const { start, end } = todayBounds()
  const statuts = newStatut === 'EN_CONSULTATION'
    ? ['EN_ATTENTE']
    : ['EN_ATTENTE', 'EN_CONSULTATION']

  const entry = await tx.fileAttente.findFirst({
    where: { patientId, dateFile: { gte: start, lte: end }, statut: { in: statuts as any } },
    orderBy: { numero: 'desc' },
  })
  if (!entry) return

  await tx.fileAttente.update({
    where: { id: entry.id },
    data: {
      statut: newStatut,
      ...(newStatut === 'EN_CONSULTATION' ? { appelleA: new Date() } : { termineA: new Date() }),
    },
  })
}

const consultationSchema = z.object({
  patientId: z.string().uuid(),
  appointmentId: z.string().uuid().optional(),
  plainte: z.string().optional(),
  diagnostic: z.string().optional(),
  notes: z.string().optional(),
  prescriptions: z.string().optional(),
  signesVitaux: z.record(z.string(), z.unknown()).optional(),
  examensTypes: z.array(z.string()).optional(),
  prochainRdv: z.string().datetime({ offset: true }).optional().nullable(),
})

const include = {
  patient: { select: { id: true, prenom: true, nom: true, numero: true } },
  medecin: { select: { id: true, prenom: true, nom: true } },
  appointment: true,
  examens: {
    orderBy: { createdAt: 'asc' as const },
    include: { medecin: { select: { id: true, prenom: true, nom: true } } }
  }
}

async function createExamens(
  tx: Prisma.TransactionClient,
  types: string[],
  patientId: string,
  consultationId: string,
  medecinId: string
) {
  const count = await tx.examen.count()
  const year  = new Date().getFullYear()
  for (let i = 0; i < types.length; i++) {
    const numero = `EXM-${year}-${String(count + i + 1).padStart(5, '0')}`
    await tx.examen.create({
      data: { numero, patientId, consultationId, medecinId, type: types[i] }
    })
  }
}

export async function createConsultation(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = consultationSchema.parse(req.body)
    const { signesVitaux, examensTypes, ...restData } = data

    const result = await prisma.$transaction(async (tx) => {
      const consultation = await tx.consultation.create({
        data: {
          ...restData,
          medecinId: req.user!.userId,
          ...(signesVitaux !== undefined && { signesVitaux: signesVitaux as Prisma.InputJsonValue }),
          ...(restData.prochainRdv != null && { prochainRdv: new Date(restData.prochainRdv) }),
        },
        include
      })

      if (examensTypes && examensTypes.length > 0) {
        await createExamens(tx, examensTypes, data.patientId, consultation.id, req.user!.userId)
      }

      if (data.appointmentId) {
        await tx.appointment.update({ where: { id: data.appointmentId }, data: { statut: 'TERMINE' } })
      }

      // Mise à jour automatique de la file d'attente
      const hasdiag = !!(restData as any).diagnostic
      await syncFileAttente(tx, data.patientId, hasdiag ? 'TERMINE' : 'EN_CONSULTATION')

      if (restData.prochainRdv) {
        const docteur = await tx.user.findUnique({
          where: { id: req.user!.userId },
          select: { serviceId: true },
        })
        let serviceId = docteur?.serviceId
        if (!serviceId) {
          const svc = await tx.service.findFirst({
            where: { nom: { contains: 'générale', mode: 'insensitive' } },
            select: { id: true },
          })
          serviceId = svc?.id
        }
        if (!serviceId) {
          const svc = await tx.service.findFirst({ select: { id: true } })
          serviceId = svc?.id
        }
        if (serviceId) {
          await tx.appointment.create({
            data: {
              patientId: data.patientId,
              medecinId: req.user!.userId,
              serviceId,
              dateHeure: new Date(restData.prochainRdv as string),
              statut:    'PLANIFIE',
              motif:     `Suivi — ${consultation.diagnostic || 'consultation du ' + new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })}`,
            },
          })
        }
      }

      return consultation
    })

    const withExamens = await prisma.consultation.findUnique({ where: { id: result.id }, include })
    audit(req.user, 'CREATE', 'Consultation', { recordId: result.id, label: `Patient ${result.patient.prenom} ${result.patient.nom}` })
    broadcast('fileattente')
    sendSuccess(res, withExamens, 201)
  } catch (err) {
    next(err)
  }
}

export async function getConsultations(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const where: Prisma.ConsultationWhereInput = {}
    if (req.query.patientId) where.patientId = String(req.query.patientId)
    const consultations = await prisma.consultation.findMany({ where, include, orderBy: { date: 'desc' } })
    sendSuccess(res, consultations)
  } catch (err) {
    next(err)
  }
}

export async function getConsultation(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const consultation = await prisma.consultation.findUnique({ where: { id: String(req.params.id) }, include })
    if (!consultation) { sendError(res, 'Consultation non trouvée', 404); return }
    sendSuccess(res, consultation)
  } catch (err) {
    next(err)
  }
}

export async function updateConsultation(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = consultationSchema.partial().omit({ patientId: true, appointmentId: true }).parse(req.body)
    const { signesVitaux, examensTypes, ...restData } = data

    const consultationId = String(req.params.id)
    const exists = await prisma.consultation.findUnique({ where: { id: consultationId } })
    if (!exists) { sendError(res, 'Consultation non trouvée', 404); return }

    await prisma.$transaction(async (tx) => {
      await tx.consultation.update({
        where: { id: consultationId },
        data: {
          ...restData,
          ...(signesVitaux !== undefined && { signesVitaux: signesVitaux as Prisma.InputJsonValue }),
          ...(restData.prochainRdv != null  && { prochainRdv: new Date(restData.prochainRdv) }),
          ...(restData.prochainRdv === null  && { prochainRdv: null }),
        },
        include
      })

      if (examensTypes && examensTypes.length > 0) {
        await createExamens(tx, examensTypes, exists.patientId, consultationId, req.user!.userId)
      }

      // Si un diagnostic est ajouté/modifié, clore automatiquement la file
      if (restData.diagnostic) {
        await syncFileAttente(tx, exists.patientId, 'TERMINE')
      }
    })

    broadcast('fileattente')
    const updated = await prisma.consultation.findUnique({ where: { id: consultationId }, include })
    sendSuccess(res, updated)
  } catch (err) { next(err) }
}

export async function deleteConsultation(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const exists = await prisma.consultation.findUnique({ where: { id: String(req.params.id) } })
    if (!exists) { sendError(res, 'Consultation non trouvée', 404); return }
    await prisma.consultation.delete({ where: { id: String(req.params.id) } })
    sendSuccess(res, { message: 'Consultation supprimée' })
  } catch (err) { next(err) }
}

export async function getConsultationsByPatient(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const consultations = await prisma.consultation.findMany({
      where: { patientId: String(req.params.patientId) },
      include,
      orderBy: { date: 'desc' }
    })
    sendSuccess(res, consultations)
  } catch (err) {
    next(err)
  }
}
