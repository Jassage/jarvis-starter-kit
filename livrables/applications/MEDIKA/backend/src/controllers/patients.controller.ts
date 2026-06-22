import { Response, NextFunction } from 'express'
import { z } from 'zod'
import prisma from '../utils/prisma'
import { sendSuccess, sendError, generateNumero } from '../utils/response'
import { AuthRequest } from '../types'
import { audit } from '../utils/audit'

const patientSchema = z.object({
  prenom: z.string().min(1),
  nom: z.string().min(1),
  dateNaissance: z.string().datetime(),
  sexe: z.enum(['M', 'F']),
  telephone: z.string().min(1),
  adresse: z.string().optional(),
  groupeSanguin: z.string().optional(),
  antecedents: z.string().optional(),
  allergies: z.string().optional()
})

export async function createPatient(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = patientSchema.parse(req.body)
    const count = await prisma.patient.count()
    const numero = generateNumero('PAT', count)

    const patient = await prisma.patient.create({
      data: { ...data, numero, dateNaissance: new Date(data.dateNaissance) }
    })
    audit(req.user, 'CREATE', 'Patient', { recordId: patient.id, label: `${patient.prenom} ${patient.nom} (${patient.numero})` })
    sendSuccess(res, patient, 201)
  } catch (err) {
    next(err)
  }
}

export async function getPatients(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const page = Number(req.query.page) || 1
    const limit = Math.min(Number(req.query.limit) || 20, 100)
    const skip = (page - 1) * limit

    const [patients, total] = await Promise.all([
      prisma.patient.findMany({ where: { actif: true }, skip, take: limit, orderBy: { createdAt: 'desc' as const } }),
      prisma.patient.count({ where: { actif: true } })
    ])

    sendSuccess(res, { patients, total, page, totalPages: Math.ceil(total / limit) })
  } catch (err) {
    next(err)
  }
}

export async function getPatient(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const patient = await prisma.patient.findUnique({
      where: { id: String(req.params.id) },
      include: {
        consultations: {
          orderBy: { date: 'desc' },
          include: {
            medecin: { select: { id: true, prenom: true, nom: true } }
          }
        },
        appointments: {
          orderBy: { dateHeure: 'desc' },
          include: {
            medecin: { select: { id: true, prenom: true, nom: true } },
            service: { select: { id: true, nom: true } }
          }
        },
        factures: {
          orderBy: { createdAt: 'desc' },
          include: { lignes: true, paiements: true }
        },
        examens: {
          orderBy: { createdAt: 'desc' },
          include: {
            medecin: { select: { id: true, prenom: true, nom: true } }
          }
        }
      }
    })
    if (!patient) { sendError(res, 'Patient non trouvé', 404); return }

    // Séjour en cours (requête séparée pour contourner le client Prisma non régénéré)
    let sejourEnCours = null
    try {
      sejourEnCours = await (prisma as any).sejour.findFirst({
        where: { patientId: patient.id, statut: 'EN_COURS' },
        include: {
          lit: { include: { chambre: { include: { service: { select: { id: true, nom: true } } } } } },
          medecin: { select: { id: true, prenom: true, nom: true } },
        },
      })
    } catch { /* module hospitalisations pas encore migré */ }

    sendSuccess(res, { ...patient, sejourEnCours })
  } catch (err) {
    next(err)
  }
}

export async function updatePatient(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = patientSchema.partial().parse(req.body)
    const patient = await prisma.patient.update({
      where: { id: String(req.params.id) },
      data: { ...data, ...(data.dateNaissance && { dateNaissance: new Date(data.dateNaissance) }) }
    })
    audit(req.user, 'UPDATE', 'Patient', { recordId: patient.id, label: `${patient.prenom} ${patient.nom}`, changes: data })
    sendSuccess(res, patient)
  } catch (err) {
    next(err)
  }
}

export async function toggleActifPatient(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const current = await prisma.patient.findUnique({ where: { id: String(req.params.id) } })
    if (!current) { sendError(res, 'Patient non trouvé', 404); return }
    const patient = await prisma.patient.update({ where: { id: current.id }, data: { actif: !current.actif } })
    audit(req.user, 'UPDATE', 'Patient', { recordId: patient.id, label: `${patient.prenom} ${patient.nom} — ${patient.actif ? 'réactivé' : 'archivé'}` })
    sendSuccess(res, patient)
  } catch (err) { next(err) }
}

export async function searchPatients(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const q = String(req.query.q || '')
    const patients = await prisma.patient.findMany({
      where: {
        actif: true,
        OR: [
          { prenom: { contains: q, mode: 'insensitive' as const } },
          { nom: { contains: q, mode: 'insensitive' as const } },
          { numero: { contains: q, mode: 'insensitive' as const } },
          { telephone: { contains: q } }
        ]
      },
      take: 20
    })
    sendSuccess(res, patients)
  } catch (err) {
    next(err)
  }
}
