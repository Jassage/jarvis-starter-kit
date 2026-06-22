import { Router } from 'express'
import { requireAuth } from '../middleware/auth'
import prisma from '../utils/prisma'
import { sendSuccess } from '../utils/response'
import { AuthRequest } from '../types'

const router = Router()
router.use(requireAuth)

function buildDayBuckets(items: any[], dateField: string, valueField?: string) {
  const buckets: Record<string, { date: string; label: string; value: number }> = {}
  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const key = d.toISOString().slice(0, 10)
    buckets[key] = {
      date: key,
      label: d.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric' }),
      value: 0,
    }
  }
  for (const item of items) {
    const key = new Date(item[dateField]).toISOString().slice(0, 10)
    if (buckets[key]) buckets[key].value += valueField ? (Number(item[valueField]) || 0) : 1
  }
  return Object.values(buckets)
}

router.get('/', async (req: AuthRequest, res, next) => {
  try {
    const role   = req.user?.role
    const userId = req.user?.userId

    const today = new Date()
    const start = new Date(today); start.setHours(0, 0, 0, 0)
    const end   = new Date(today); end.setHours(23, 59, 59, 999)
    const sevenDaysAgo = new Date(today)
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6)
    sevenDaysAgo.setHours(0, 0, 0, 0)

    const mWhere: any = role === 'MEDECIN' ? { medecinId: userId } : {}

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
      recettesResult,
      patientsAujourdhui,
      consultations7jRaw,
      paiements7jRaw,
      rdvParStatutRaw,
      facturesParStatutRaw,
      examensParStatutRaw,
      fileAttenteRaw,
      paiementsMethodeRaw,
    ] = await Promise.all([
      prisma.patient.count({ where: { actif: true } }),
      prisma.appointment.count({ where: { dateHeure: { gte: start, lte: end }, ...mWhere } }),
      prisma.appointment.count({ where: { dateHeure: { gte: start, lte: end }, statut: { in: ['PLANIFIE', 'EN_ATTENTE', 'EN_CONSULTATION'] }, ...mWhere } }),
      prisma.consultation.count({ where: { date: { gte: start, lte: end }, ...mWhere } }),
      prisma.facture.count({ where: { statut: { in: ['EN_ATTENTE', 'PARTIELLEMENT_PAYE'] } } }),
      prisma.examen.count({ where: { statut: { in: ['EN_ATTENTE', 'EN_COURS'] }, ...mWhere } }),
      prisma.facture.aggregate({ where: { statut: { in: ['EN_ATTENTE', 'PARTIELLEMENT_PAYE'] } }, _sum: { montantTotal: true, montantPaye: true } }),
      prisma.appointment.findMany({
        where: { dateHeure: { gte: start, lte: end }, ...mWhere },
        include: {
          patient: { select: { id: true, prenom: true, nom: true, numero: true } },
          medecin: { select: { id: true, prenom: true, nom: true } },
          service:  { select: { id: true, nom: true } },
        },
        orderBy: { dateHeure: 'asc' },
      }),
      prisma.patient.findMany({
        where: { actif: true },
        orderBy: { createdAt: 'desc' },
        take: 6,
        select: { id: true, prenom: true, nom: true, numero: true, dateNaissance: true, telephone: true, sexe: true, createdAt: true },
      }),
      (prisma as any).sejour.count({ where: { statut: 'EN_COURS' } }).catch(() => 0),
      (prisma as any).lit.count({ where: { statut: 'OCCUPE' } }).catch(() => 0),
      (prisma as any).lit.count().catch(() => 0),
      (prisma as any).paiement.aggregate({ where: { date: { gte: start, lte: end } }, _sum: { montant: true } }).catch(() => ({ _sum: { montant: 0 } })),
      prisma.patient.count({ where: { createdAt: { gte: start, lte: end } } }),
      prisma.consultation.findMany({ where: { date: { gte: sevenDaysAgo }, ...mWhere }, select: { date: true } }),
      (prisma as any).paiement.findMany({ where: { date: { gte: sevenDaysAgo } }, select: { date: true, montant: true } }).catch(() => []),
      prisma.appointment.groupBy({ by: ['statut'], where: { dateHeure: { gte: start, lte: end }, ...mWhere }, _count: { _all: true } }),
      prisma.facture.groupBy({ by: ['statut'], _count: { _all: true } }),
      prisma.examen.groupBy({ by: ['statut'], _count: { _all: true } }),
      prisma.fileAttente.findMany({ where: { dateFile: { gte: start, lte: end } }, select: { statut: true } }).catch(() => []),
      (prisma as any).paiement.findMany({ where: { date: { gte: sevenDaysAgo } }, select: { methode: true, montant: true } }).catch(() => []),
    ])

    const montantTotal = montantResult._sum.montantTotal ?? 0
    const montantPaye  = montantResult._sum.montantPaye  ?? 0

    const methodeBuckets: Record<string, number> = {}
    for (const p of paiementsMethodeRaw) {
      methodeBuckets[p.methode] = (methodeBuckets[p.methode] || 0) + Number(p.montant)
    }

    const STATUTS_FILE = ['EN_ATTENTE', 'EN_CONSULTATION', 'TERMINE', 'ABSENT']
    const fileAttenteStatuts = STATUTS_FILE.map(s => ({
      statut: s,
      count: (fileAttenteRaw as any[]).filter((e: any) => e.statut === s).length,
    }))

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
      patientsAujourdhui,
      chartData: {
        consultations7j:     buildDayBuckets(consultations7jRaw, 'date'),
        recettes7j:          buildDayBuckets(paiements7jRaw, 'date', 'montant'),
        rdvParStatut:        rdvParStatutRaw.map((r: any) => ({ statut: r.statut, count: r._count._all })),
        facturesParStatut:   facturesParStatutRaw.map((r: any) => ({ statut: r.statut, count: r._count._all })),
        examensParStatut:    examensParStatutRaw.map((r: any) => ({ statut: r.statut, count: r._count._all })),
        paiementsParMethode: Object.entries(methodeBuckets).map(([methode, montant]) => ({ methode, montant })),
        fileAttenteStatuts,
        litsOccupation: { occupe: litsOccupes as number, libre: Math.max(0, (litsTotal as number) - (litsOccupes as number)) },
      },
    })
  } catch (err) { next(err) }
})

router.get('/rapport', async (req, res, next) => {
  try {
    const today = new Date()

    // Période : from/to en query string (YYYY-MM-DD), sinon aujourd'hui
    const fromStr = String(req.query.from || '')
    const toStr   = String(req.query.to   || '')

    const start = fromStr ? new Date(fromStr) : new Date(today)
    const end   = toStr   ? new Date(toStr)   : new Date(today)
    start.setHours(0, 0, 0, 0)
    end.setHours(23, 59, 59, 999)

    const [appointments, consultations, examens, facturesJour, facturesImpayes, config] = await Promise.all([
      prisma.appointment.findMany({
        where:   { dateHeure: { gte: start, lte: end } },
        include: { patient: { select: { prenom: true, nom: true, numero: true } }, medecin: { select: { prenom: true, nom: true } }, service: { select: { nom: true } } },
        orderBy: { dateHeure: 'asc' },
      }),
      prisma.consultation.findMany({
        where:   { date: { gte: start, lte: end } },
        include: { patient: { select: { prenom: true, nom: true, numero: true } }, medecin: { select: { prenom: true, nom: true } } },
        orderBy: { date: 'asc' },
      }),
      prisma.examen.findMany({
        where:   { createdAt: { gte: start, lte: end } },
        include: { patient: { select: { prenom: true, nom: true } }, medecin: { select: { prenom: true, nom: true } } },
        orderBy: { createdAt: 'asc' },
      }),
      prisma.facture.findMany({
        where:   { createdAt: { gte: start, lte: end } },
        include: { patient: { select: { prenom: true, nom: true } } },
        orderBy: { createdAt: 'asc' },
      }),
      prisma.facture.aggregate({
        where: { statut: { in: ['EN_ATTENTE', 'PARTIELLEMENT_PAYE'] } },
        _sum:  { montantTotal: true, montantPaye: true },
      }),
      (prisma as any).hopitalConfig.findUnique({ where: { id: 'singleton' } }).catch(() => null),
    ])

    const recettes     = facturesJour.filter(f => f.statut === 'PAYE').reduce((s, f) => s + f.montantPaye, 0)
    const impayesTotal = (facturesImpayes._sum.montantTotal ?? 0) - (facturesImpayes._sum.montantPaye ?? 0)

    sendSuccess(res, {
      date: start,
      dateFin: end,
      hopital: config,
      appointments,
      consultations,
      examens,
      facturesJour,
      recettesJour: recettes,
      impayesTotal,
    })
  } catch (err) { next(err) }
})

export default router
