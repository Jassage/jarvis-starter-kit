import { Router } from 'express'
import { requireAuth, requireRole } from '../middleware/auth'
import prisma from '../utils/prisma'
import { sendSuccess, sendError } from '../utils/response'
import { broadcast } from '../utils/eventBus'
import { AuthRequest } from '../types'

const router = Router()
router.use(requireAuth)

const p = prisma as any

// ── Helpers ──────────────────────────────────────────────────────────────────

function isoDay(d: Date) { return d.toISOString().split('T')[0] }

function weekRange(dateStr: string) {
  const d   = new Date(dateStr)
  const day = d.getDay() || 7
  const mon = new Date(d); mon.setDate(d.getDate() - day + 1); mon.setHours(0,0,0,0)
  const sun = new Date(mon); sun.setDate(mon.getDate() + 6); sun.setHours(23,59,59,999)
  return { debut: mon, fin: sun }
}

// ── Gardes ───────────────────────────────────────────────────────────────────

router.get('/gardes', async (req: AuthRequest, res, next) => {
  try {
    const { semaine, serviceId, userId: qUserId, from, to } = req.query
    const where: any = {}

    if (semaine) {
      const { debut, fin } = weekRange(String(semaine))
      where.date = { gte: debut, lte: fin }
    } else if (from || to) {
      where.date = {}
      if (from) where.date.gte = new Date(String(from))
      if (to)   where.date.lte = new Date(String(to))
    }
    if (serviceId) where.serviceId = String(serviceId)
    if (qUserId)   where.userId    = String(qUserId)

    const gardes = await p.garde.findMany({
      where,
      include: {
        user:    { select: { id: true, prenom: true, nom: true, role: true } },
        service: { select: { id: true, nom: true } },
      },
      orderBy: { date: 'asc' },
    })
    sendSuccess(res, gardes)
  } catch (err) { next(err) }
})

router.post('/gardes', requireRole('ADMIN'), async (req: AuthRequest, res, next) => {
  try {
    const { userId, serviceId, type, date, heureDebut, heureFin, notes } = req.body
    if (!userId || !type || !date || !heureDebut || !heureFin) {
      sendError(res, 'userId, type, date, heureDebut et heureFin sont requis', 400); return
    }
    const typesValides = ['JOUR', 'NUIT', 'ASTREINTE', 'URGENCE']
    if (!typesValides.includes(type)) { sendError(res, 'Type invalide', 400); return }

    const dateObj = new Date(date)

    // Vérifier si garde déjà existante ce jour pour ce user
    const overlap = await p.garde.findFirst({
      where: { userId, date: dateObj },
    })
    if (overlap) { sendError(res, 'Ce personnel a déjà une garde ce jour-là', 409); return }

    const garde = await p.garde.create({
      data: {
        userId,
        serviceId: serviceId || null,
        type,
        date:      dateObj,
        heureDebut,
        heureFin,
        notes: notes?.trim() || null,
      },
      include: {
        user:    { select: { id: true, prenom: true, nom: true, role: true } },
        service: { select: { id: true, nom: true } },
      },
    })
    broadcast('planning')
    sendSuccess(res, garde, 201)
  } catch (err) { next(err) }
})

router.patch('/gardes/:id', requireRole('ADMIN'), async (req: AuthRequest, res, next) => {
  try {
    const { type, serviceId, heureDebut, heureFin, notes } = req.body

    const garde = await p.garde.findUnique({ where: { id: String(req.params.id) } })
    if (!garde) { sendError(res, 'Garde introuvable', 404); return }

    const updated = await p.garde.update({
      where: { id: garde.id },
      data: {
        ...(type      && { type }),
        ...(serviceId !== undefined && { serviceId: serviceId || null }),
        ...(heureDebut && { heureDebut }),
        ...(heureFin   && { heureFin }),
        ...(notes      !== undefined && { notes: notes?.trim() || null }),
      },
      include: {
        user:    { select: { id: true, prenom: true, nom: true } },
        service: { select: { id: true, nom: true } },
      },
    })
    broadcast('planning')
    sendSuccess(res, updated)
  } catch (err) { next(err) }
})

router.delete('/gardes/:id', requireRole('ADMIN'), async (req: AuthRequest, res, next) => {
  try {
    await p.garde.delete({ where: { id: String(req.params.id) } })
    broadcast('planning')
    sendSuccess(res, { ok: true })
  } catch (err) { next(err) }
})

// ── Gardes du jour ────────────────────────────────────────────────────────────

router.get('/gardes/today', async (_req, res, next) => {
  try {
    const now   = new Date()
    const debut = new Date(now); debut.setHours(0,0,0,0)
    const fin   = new Date(now); fin.setHours(23,59,59,999)

    const gardes = await p.garde.findMany({
      where: { date: { gte: debut, lte: fin } },
      include: {
        user:    { select: { id: true, prenom: true, nom: true, role: true } },
        service: { select: { id: true, nom: true } },
      },
      orderBy: { heureDebut: 'asc' },
    })
    sendSuccess(res, gardes)
  } catch (err) { next(err) }
})

// ── Disponibilité ────────────────────────────────────────────────────────────

router.get('/disponibilite', async (req: AuthRequest, res, next) => {
  try {
    const dateStr = req.query.date ? String(req.query.date) : new Date().toISOString()
    const cible   = new Date(dateStr)
    const debutJ  = new Date(cible); debutJ.setHours(0,0,0,0)
    const finJ    = new Date(cible); finJ.setHours(23,59,59,999)

    const [enGarde, enAbsence] = await Promise.all([
      p.garde.findMany({
        where: { date: { gte: debutJ, lte: finJ } },
        select: { userId: true },
      }),
      p.absence.findMany({
        where: { statut: 'APPROUVE', dateDebut: { lte: cible }, dateFin: { gte: cible } },
        select: { userId: true },
      }),
    ])
    const idsEnGarde   = enGarde.map((g: any) => g.userId)
    const idsEnAbsence = enAbsence.map((a: any) => a.userId)

    const personnel = await prisma.user.findMany({
      where: { role: { in: ['MEDECIN', 'INFIRMIER'] }, actif: true },
      select: { id: true, prenom: true, nom: true, role: true },
      orderBy: [{ role: 'asc' }, { nom: 'asc' }],
    })

    sendSuccess(res, personnel.map(u => ({
      ...u,
      enGarde:    idsEnGarde.includes(u.id),
      enAbsence:  idsEnAbsence.includes(u.id),
      disponible: !idsEnAbsence.includes(u.id),
    })))
  } catch (err) { next(err) }
})

// ── Absences ─────────────────────────────────────────────────────────────────

router.get('/absences', async (req: AuthRequest, res, next) => {
  try {
    const { statut, userId: qUserId } = req.query
    const where: any = {}
    if (statut)   where.statut = String(statut)
    if (qUserId)  where.userId = String(qUserId)
    if (req.user!.role !== 'ADMIN' && !qUserId) where.userId = req.user!.userId

    const absences = await p.absence.findMany({
      where,
      include: {
        user:       { select: { id: true, prenom: true, nom: true, role: true } },
        approvedBy: { select: { id: true, prenom: true, nom: true } },
      },
      orderBy: { dateDebut: 'desc' },
    })
    sendSuccess(res, absences)
  } catch (err) { next(err) }
})

router.post('/absences', async (req: AuthRequest, res, next) => {
  try {
    const { type, dateDebut, dateFin, raison } = req.body
    if (!type || !dateDebut || !dateFin) { sendError(res, 'type, dateDebut et dateFin requis', 400); return }
    const typesValides = ['CONGE', 'MALADIE', 'FORMATION', 'AUTRE']
    if (!typesValides.includes(type)) { sendError(res, 'Type invalide', 400); return }

    const debut = new Date(dateDebut)
    const fin   = new Date(dateFin)
    if (fin < debut) { sendError(res, 'La date de fin doit être après le début', 400); return }

    const absence = await p.absence.create({
      data: {
        userId:    req.user!.userId,
        type,
        dateDebut: debut,
        dateFin:   fin,
        raison:    raison?.trim() || null,
      },
      include: { user: { select: { prenom: true, nom: true, role: true } } },
    })
    broadcast('planning')
    sendSuccess(res, absence, 201)
  } catch (err) { next(err) }
})

router.patch('/absences/:id', requireRole('ADMIN'), async (req: AuthRequest, res, next) => {
  try {
    const { statut } = req.body
    const allowed = ['EN_ATTENTE', 'APPROUVE', 'REJETE']
    if (!allowed.includes(statut)) { sendError(res, 'Statut invalide', 400); return }

    const absence = await p.absence.findUnique({ where: { id: String(req.params.id) } })
    if (!absence) { sendError(res, 'Absence introuvable', 404); return }

    const updated = await p.absence.update({
      where: { id: absence.id },
      data: {
        statut,
        approvedById: req.user!.userId,
      },
      include: {
        user:       { select: { prenom: true, nom: true } },
        approvedBy: { select: { prenom: true, nom: true } },
      },
    })
    broadcast('planning')
    sendSuccess(res, updated)
  } catch (err) { next(err) }
})

// ── Vue planning semaine ──────────────────────────────────────────────────────

router.get('/vue-semaine', async (req: AuthRequest, res, next) => {
  try {
    const semaine   = req.query.semaine ? String(req.query.semaine) : new Date().toISOString()
    const serviceId = req.query.serviceId ? String(req.query.serviceId) : undefined
    const { debut, fin } = weekRange(semaine)

    const [gardes, absences, services] = await Promise.all([
      p.garde.findMany({
        where: {
          date: { gte: debut, lte: fin },
          ...(serviceId && { serviceId }),
        },
        include: {
          user:    { select: { id: true, prenom: true, nom: true, role: true } },
          service: { select: { id: true, nom: true } },
        },
        orderBy: [{ date: 'asc' }, { heureDebut: 'asc' }],
      }),
      p.absence.findMany({
        where: { statut: 'APPROUVE', dateDebut: { lte: fin }, dateFin: { gte: debut } },
        include: { user: { select: { id: true, prenom: true, nom: true, role: true } } },
      }),
      prisma.service.findMany({ select: { id: true, nom: true } }),
    ])

    sendSuccess(res, { periode: { debut, fin }, gardes, absences, services })
  } catch (err) { next(err) }
})

export default router
