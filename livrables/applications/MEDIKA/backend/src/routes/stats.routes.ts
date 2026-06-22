import { Router } from 'express'
import { requireAuth } from '../middleware/auth'
import prisma from '../utils/prisma'
import { sendSuccess } from '../utils/response'

const router = Router()
router.use(requireAuth)

router.get('/', async (_req, res, next) => {
  try {
    const today = new Date()
    const start = new Date(today); start.setHours(0, 0, 0, 0)
    const end   = new Date(today); end.setHours(23, 59, 59, 999)

    const [
      patientsTotal,
      appointmentsAujourdhui,
      appointmentsEnAttente,
      consultationsAujourdhui,
      facturesImpayes,
      examensEnAttente,
      montantResult,
      appointmentDetails,
      recentPatients,
      sejoursActifs,
      litsOccupes,
      litsTotal,
      recettesResult
    ] = await Promise.all([
      prisma.patient.count({ where: { actif: true } }),
      prisma.appointment.count({ where: { dateHeure: { gte: start, lte: end } } }),
      prisma.appointment.count({ where: { dateHeure: { gte: start, lte: end }, statut: { in: ['PLANIFIE', 'EN_ATTENTE', 'EN_CONSULTATION'] } } }),
      prisma.consultation.count({ where: { date: { gte: start, lte: end } } }),
      prisma.facture.count({ where: { statut: { in: ['EN_ATTENTE', 'PARTIELLEMENT_PAYE'] } } }),
      prisma.examen.count({ where: { statut: { in: ['EN_ATTENTE', 'EN_COURS'] } } }),
      prisma.facture.aggregate({
        where: { statut: { in: ['EN_ATTENTE', 'PARTIELLEMENT_PAYE'] } },
        _sum: { montantTotal: true, montantPaye: true }
      }),
      prisma.appointment.findMany({
        where: { dateHeure: { gte: start, lte: end } },
        include: {
          patient: { select: { id: true, prenom: true, nom: true, numero: true } },
          medecin: { select: { id: true, prenom: true, nom: true } },
          service:  { select: { id: true, nom: true } }
        },
        orderBy: { dateHeure: 'asc' }
      }),
      prisma.patient.findMany({
        where: { actif: true },
        orderBy: { createdAt: 'desc' },
        take: 6,
        select: { id: true, prenom: true, nom: true, numero: true, dateNaissance: true, telephone: true, sexe: true, createdAt: true }
      }),
      (prisma as any).sejour.count({ where: { statut: 'EN_COURS' } }).catch(() => 0),
      (prisma as any).lit.count({ where: { statut: 'OCCUPE' } }).catch(() => 0),
      (prisma as any).lit.count().catch(() => 0),
      (prisma as any).paiement.aggregate({ where: { date: { gte: start, lte: end } }, _sum: { montant: true } }).catch(() => ({ _sum: { montant: 0 } })),
    ])

    const montantTotal = montantResult._sum.montantTotal ?? 0
    const montantPaye  = montantResult._sum.montantPaye  ?? 0

    sendSuccess(res, {
      patientsTotal,
      appointmentsAujourdhui,
      appointmentsEnAttente,
      consultationsAujourdhui,
      facturesImpayes,
      examensEnAttente,
      montantImpayes: montantTotal - montantPaye,
      appointmentDetails,
      recentPatients,
      sejoursActifs,
      litsOccupes,
      litsTotal,
      recettesJour: recettesResult._sum?.montant ?? 0,
    })
  } catch (err) { next(err) }
})

router.get('/rapport', async (_req, res, next) => {
  try {
    const today = new Date()
    const start = new Date(today); start.setHours(0, 0, 0, 0)
    const end   = new Date(today); end.setHours(23, 59, 59, 999)

    const [appointments, consultations, examens, facturesJour, facturesImpayes, config] = await Promise.all([
      prisma.appointment.findMany({
        where:   { dateHeure: { gte: start, lte: end } },
        include: { patient: { select: { prenom: true, nom: true, numero: true } }, medecin: { select: { prenom: true, nom: true } }, service: { select: { nom: true } } },
        orderBy: { dateHeure: 'asc' }
      }),
      prisma.consultation.findMany({
        where:   { date: { gte: start, lte: end } },
        include: { patient: { select: { prenom: true, nom: true, numero: true } }, medecin: { select: { prenom: true, nom: true } } },
        orderBy: { date: 'asc' }
      }),
      prisma.examen.findMany({
        where:   { createdAt: { gte: start, lte: end } },
        include: { patient: { select: { prenom: true, nom: true } }, medecin: { select: { prenom: true, nom: true } } },
        orderBy: { createdAt: 'asc' }
      }),
      prisma.facture.findMany({
        where:   { createdAt: { gte: start, lte: end } },
        include: { patient: { select: { prenom: true, nom: true } } },
        orderBy: { createdAt: 'asc' }
      }),
      prisma.facture.aggregate({
        where: { statut: { in: ['EN_ATTENTE', 'PARTIELLEMENT_PAYE'] } },
        _sum:  { montantTotal: true, montantPaye: true }
      }),
      (prisma as any).hopitalConfig.findUnique({ where: { id: 'singleton' } }).catch(() => null),
    ])

    const recettesJour = facturesJour.filter(f => f.statut === 'PAYE').reduce((s, f) => s + f.montantPaye, 0)
    const impayesTotal = (facturesImpayes._sum.montantTotal ?? 0) - (facturesImpayes._sum.montantPaye ?? 0)

    sendSuccess(res, {
      date: today,
      hopital: config,
      appointments,
      consultations,
      examens,
      facturesJour,
      recettesJour,
      impayesTotal,
    })
  } catch (err) { next(err) }
})

export default router
