import { Router } from 'express'
import { z } from 'zod'
import { requireAuth, requireRole } from '../middleware/auth'
import prisma from '../utils/prisma'
import { sendSuccess, sendError } from '../utils/response'
import { AuthRequest } from '../types'

const router = Router()
router.use(requireAuth)

const triageInclude = {
  fileAttente: {
    include: {
      patient: { select: { id: true, prenom: true, nom: true, numero: true, telephone: true, dateNaissance: true, groupeSanguin: true, allergies: true } },
      medecin: { select: { id: true, prenom: true, nom: true } },
    },
  },
  triagedBy: { select: { id: true, prenom: true, nom: true } },
}

function todayBounds() {
  const d = new Date()
  const start = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0)
  const end   = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999)
  return { start, end }
}

// GET /urgences — patients URGENT+CRITIQUE encore dans la file (EN_ATTENTE ou EN_CONSULTATION)
router.get('/', async (_req, res, next) => {
  try {
    const { start, end } = todayBounds()
    const entries = await prisma.fileAttente.findMany({
      where: {
        dateFile: { gte: start, lte: end },
        priorite: { in: ['URGENT', 'CRITIQUE'] },
        statut: { in: ['EN_ATTENTE', 'EN_CONSULTATION'] },
      },
      include: {
        patient: { select: { id: true, prenom: true, nom: true, numero: true, telephone: true, dateNaissance: true, groupeSanguin: true, allergies: true } },
        medecin: { select: { id: true, prenom: true, nom: true } },
        triage: { include: { triagedBy: { select: { id: true, prenom: true, nom: true } } } },
      },
      orderBy: { numero: 'asc' },
    })

    const rank: Record<string, number> = { CRITIQUE: 0, URGENT: 1 }
    entries.sort((a: any, b: any) => {
      const pa = rank[a.priorite] ?? 1
      const pb = rank[b.priorite] ?? 1
      if (pa !== pb) return pa - pb
      return a.numero - b.numero
    })

    sendSuccess(res, entries)
  } catch (err) { next(err) }
})

// GET /urgences/triage/:fileAttenteId
router.get('/triage/:fileAttenteId', async (req, res, next) => {
  try {
    const triage = await prisma.triageUrgence.findUnique({
      where: { fileAttenteId: String(req.params.fileAttenteId) },
      include: triageInclude,
    })
    if (!triage) { sendError(res, 'Aucun triage pour ce patient', 404); return }
    sendSuccess(res, triage)
  } catch (err) { next(err) }
})

// POST /urgences/triage/:fileAttenteId — créer ou mettre à jour le triage
router.post('/triage/:fileAttenteId', requireRole('ADMIN', 'MEDECIN', 'INFIRMIER'), async (req: AuthRequest, res, next) => {
  try {
    const fa = await prisma.fileAttente.findUnique({ where: { id: String(req.params.fileAttenteId) } })
    if (!fa) { sendError(res, 'Patient non trouvé dans la file', 404); return }

    const data = z.object({
      gcYeux:             z.number().int().min(1).max(4).optional(),
      gcVerbal:           z.number().int().min(1).max(5).optional(),
      gcMoteur:           z.number().int().min(1).max(6).optional(),
      saturationO2:       z.number().min(0).max(100).optional(),
      freqRespiratoire:   z.number().int().min(0).optional(),
      freqCardiaque:      z.number().int().min(0).optional(),
      tensionSystolique:  z.number().int().min(0).optional(),
      tensionDiastolique: z.number().int().min(0).optional(),
      temperature:        z.number().min(30).max(45).optional(),
      douleur:            z.number().int().min(0).max(10).optional(),
      notesTriage:        z.string().optional(),
    }).parse(req.body)

    const triage = await prisma.triageUrgence.upsert({
      where: { fileAttenteId: String(req.params.fileAttenteId) },
      update: { ...data, triagedById: req.user?.userId, triagedAt: new Date() },
      create: { ...data, fileAttenteId: String(req.params.fileAttenteId), triagedById: req.user?.userId },
      include: triageInclude,
    })

    sendSuccess(res, triage)
  } catch (err) { next(err) }
})

// POST /urgences/hospitaliser/:fileAttenteId — admission directe depuis la salle de triage
router.post('/hospitaliser/:fileAttenteId', requireRole('ADMIN', 'MEDECIN'), async (req: AuthRequest, res, next) => {
  try {
    const fa = await prisma.fileAttente.findUnique({
      where: { id: String(req.params.fileAttenteId) },
      include: { patient: true },
    })
    if (!fa) { sendError(res, 'Patient non trouvé dans la file', 404); return }

    const dejaHospitalise = await (prisma as any).sejour.findFirst({
      where: { patientId: fa.patientId, statut: 'EN_COURS' },
    })
    if (dejaHospitalise) {
      sendError(res, 'Ce patient est déjà hospitalisé.', 400)
      return
    }

    const data = z.object({
      litId:  z.string().uuid(),
      motif:  z.string().optional(),
      notes:  z.string().optional(),
    }).parse(req.body)

    const medecinId = req.user?.userId!

    const lit = await (prisma as any).lit.findUnique({ where: { id: data.litId } })
    if (!lit) { sendError(res, 'Lit non trouvé', 404); return }
    if (lit.statut !== 'DISPONIBLE') { sendError(res, 'Ce lit n\'est pas disponible', 400); return }

    const sejour = await prisma.$transaction(async (tx) => {
      const s = await (tx as any).sejour.create({
        data: {
          patientId:     fa.patientId,
          litId:         data.litId,
          medecinId,
          motif:         data.motif ?? fa.motif ?? 'Hospitalisation d\'urgence',
          notes:         data.notes,
          dateAdmission: new Date(),
        },
      })
      await (tx as any).lit.update({ where: { id: data.litId }, data: { statut: 'OCCUPE' } })
      await tx.fileAttente.update({
        where: { id: fa.id },
        data: { statut: 'TERMINE', termineA: new Date() },
      })
      return s
    })

    sendSuccess(res, sejour, 201)
  } catch (err) { next(err) }
})

export default router
