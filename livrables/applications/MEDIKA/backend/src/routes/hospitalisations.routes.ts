import { Router } from 'express'
import { requireAuth, requireRole } from '../middleware/auth'
import prisma from '../utils/prisma'
import { sendSuccess, sendError, generateNumero } from '../utils/response'
import { audit } from '../utils/audit'
import { broadcast } from '../utils/eventBus'
import { AuthRequest } from '../types'

const PRIX_NUIT: Record<string, number> = {
  STANDARD:       1_500,
  SOINS_INTENSIFS: 5_000,
  MATERNITE:      2_000,
  PEDIATRIE:      1_800,
  ISOLEMENT:      3_000,
}

const router = Router()
router.use(requireAuth)

const sejourInclude = {
  patient: { select: { id: true, prenom: true, nom: true, numero: true, dateNaissance: true, telephone: true, groupeSanguin: true, allergies: true } },
  medecin: { select: { id: true, prenom: true, nom: true } },
  lit:     { include: { chambre: { include: { service: { select: { id: true, nom: true } } } } } },
}

// ── Stats globales ─────────────────────────────────────────────────────────────
router.get('/stats', async (_req, res, next) => {
  try {
    const [total, disponibles, occupes, maintenance, sejoursEnCours] = await Promise.all([
      (prisma as any).lit.count(),
      (prisma as any).lit.count({ where: { statut: 'DISPONIBLE' } }),
      (prisma as any).lit.count({ where: { statut: 'OCCUPE' } }),
      (prisma as any).lit.count({ where: { statut: 'MAINTENANCE' } }),
      (prisma as any).sejour.count({ where: { statut: 'EN_COURS' } }),
    ])
    sendSuccess(res, { total, disponibles, occupes, maintenance, reserve: total - disponibles - occupes - maintenance, sejoursEnCours })
  } catch (err) { next(err) }
})

// ── Chambres ───────────────────────────────────────────────────────────────────
router.get('/chambres', async (_req, res, next) => {
  try {
    const chambres = await (prisma as any).chambre.findMany({
      where:   { actif: true },
      include: {
        service: { select: { id: true, nom: true } },
        lits:    {
          include: {
            sejours: {
              where:   { statut: 'EN_COURS' },
              include: { patient: { select: { id: true, prenom: true, nom: true, numero: true } }, medecin: { select: { prenom: true, nom: true } } },
              take: 1,
            }
          }
        }
      },
      orderBy: [{ etage: 'asc' }, { numero: 'asc' }]
    })
    sendSuccess(res, chambres)
  } catch (err) { next(err) }
})

router.post('/chambres', requireRole('ADMIN'), async (req: AuthRequest, res, next) => {
  try {
    const { numero, etage, serviceId, type } = req.body
    if (!numero?.trim()) { sendError(res, 'Numéro requis', 400); return }
    const chambre = await (prisma as any).chambre.create({ data: { numero: numero.trim(), etage: etage ? Number(etage) : null, serviceId: serviceId || null, type: type || 'STANDARD' } })
    sendSuccess(res, chambre, 201)
  } catch (err) { next(err) }
})

router.patch('/chambres/:id', requireRole('ADMIN'), async (req: AuthRequest, res, next) => {
  try {
    const { numero, etage, serviceId, type } = req.body
    if (!numero?.trim()) { sendError(res, 'Numéro requis', 400); return }
    const chambre = await (prisma as any).chambre.update({
      where: { id: String(req.params.id) },
      data: {
        numero:    numero.trim(),
        etage:     etage !== undefined ? (etage ? Number(etage) : null) : undefined,
        serviceId: serviceId !== undefined ? (serviceId || null) : undefined,
        type:      type || undefined,
      },
    })
    broadcast('hospitalisations')
    sendSuccess(res, chambre)
  } catch (err) { next(err) }
})

router.delete('/chambres/:id', requireRole('ADMIN'), async (req: AuthRequest, res, next) => {
  try {
    const chambre = await (prisma as any).chambre.findUnique({
      where:   { id: String(req.params.id) },
      include: { _count: { select: { lits: true } } },
    })
    if (!chambre) { sendError(res, 'Chambre introuvable', 404); return }
    if (chambre._count.lits > 0) { sendError(res, 'Supprimez d\'abord tous les lits de cette chambre', 400); return }
    await (prisma as any).chambre.delete({ where: { id: chambre.id } })
    broadcast('hospitalisations')
    sendSuccess(res, { ok: true })
  } catch (err) { next(err) }
})

// ── Lits ───────────────────────────────────────────────────────────────────────
router.post('/lits', requireRole('ADMIN'), async (req: AuthRequest, res, next) => {
  try {
    const { numero, chambreId } = req.body
    if (!numero?.trim() || !chambreId) { sendError(res, 'Numéro et chambre requis', 400); return }
    const lit = await (prisma as any).lit.create({ data: { numero: numero.trim(), chambreId } })
    sendSuccess(res, lit, 201)
  } catch (err) { next(err) }
})

router.patch('/lits/:id', requireRole('ADMIN'), async (req: AuthRequest, res, next) => {
  try {
    const { numero, chambreId } = req.body
    if (!numero?.trim()) { sendError(res, 'Numéro requis', 400); return }
    const lit = await (prisma as any).lit.update({
      where: { id: String(req.params.id) },
      data: {
        numero:   numero.trim(),
        ...(chambreId && { chambreId }),
      },
    })
    broadcast('hospitalisations')
    sendSuccess(res, lit)
  } catch (err) { next(err) }
})

router.delete('/lits/:id', requireRole('ADMIN'), async (req: AuthRequest, res, next) => {
  try {
    const lit = await (prisma as any).lit.findUnique({ where: { id: String(req.params.id) } })
    if (!lit) { sendError(res, 'Lit introuvable', 404); return }
    if (lit.statut === 'OCCUPE') { sendError(res, 'Impossible de supprimer un lit occupé', 400); return }
    await (prisma as any).lit.delete({ where: { id: lit.id } })
    broadcast('hospitalisations')
    sendSuccess(res, { ok: true })
  } catch (err) { next(err) }
})

router.patch('/lits/:id/statut', requireRole('ADMIN', 'INFIRMIER'), async (req: AuthRequest, res, next) => {
  try {
    const { statut } = req.body
    const allowed = ['DISPONIBLE', 'MAINTENANCE', 'RESERVE']
    if (!allowed.includes(statut)) { sendError(res, 'Statut invalide', 400); return }
    const lit = await (prisma as any).lit.update({ where: { id: String(req.params.id) }, data: { statut } })
    broadcast('hospitalisations')
    sendSuccess(res, lit)
  } catch (err) { next(err) }
})

// ── Séjours ────────────────────────────────────────────────────────────────────
router.get('/sejours', async (req: AuthRequest, res, next) => {
  try {
    const where: any = {}
    if (req.query.statut)    where.statut    = String(req.query.statut)
    if (req.query.patientId) where.patientId = String(req.query.patientId)
    const sejours = await (prisma as any).sejour.findMany({ where, include: sejourInclude, orderBy: { dateAdmission: 'desc' } })
    sendSuccess(res, sejours)
  } catch (err) { next(err) }
})

router.post('/sejours', requireRole('ADMIN', 'MEDECIN', 'INFIRMIER'), async (req: AuthRequest, res, next) => {
  try {
    const { patientId, litId, motif, notes } = req.body
    if (!patientId || !litId) { sendError(res, 'Patient et lit requis', 400); return }

    const lit = await (prisma as any).lit.findUnique({ where: { id: litId } })
    if (!lit) { sendError(res, 'Lit introuvable', 404); return }
    if (lit.statut !== 'DISPONIBLE') { sendError(res, 'Ce lit n\'est pas disponible', 400); return }

    const sejourActif = await (prisma as any).sejour.findFirst({ where: { patientId, statut: 'EN_COURS' } })
    if (sejourActif) { sendError(res, 'Ce patient est déjà hospitalisé', 400); return }

    const [sejour] = await (prisma as any).$transaction([
      (prisma as any).sejour.create({
        data: { patientId, litId, medecinId: req.user!.userId, motif: motif?.trim() || null, notes: notes?.trim() || null },
        include: sejourInclude,
      }),
      (prisma as any).lit.update({ where: { id: litId }, data: { statut: 'OCCUPE' } }),
    ])
    audit(req.user, 'CREATE', 'Sejour', { recordId: sejour.id, label: `Admission — Lit ${lit.numero}` })
    broadcast('hospitalisations')
    sendSuccess(res, sejour, 201)
  } catch (err) { next(err) }
})

router.patch('/sejours/:id/sortie', requireRole('ADMIN', 'MEDECIN', 'INFIRMIER'), async (req: AuthRequest, res, next) => {
  try {
    const { notes } = req.body
    const sejour = await (prisma as any).sejour.findUnique({ where: { id: String(req.params.id) }, include: { lit: true } })
    if (!sejour) { sendError(res, 'Séjour introuvable', 404); return }
    if (sejour.statut !== 'EN_COURS') { sendError(res, 'Séjour déjà clôturé', 400); return }

    const [updated] = await (prisma as any).$transaction([
      (prisma as any).sejour.update({
        where: { id: sejour.id },
        data:  { statut: 'SORTI', dateSortie: new Date(), ...(notes && { notes }) },
        include: sejourInclude,
      }),
      (prisma as any).lit.update({ where: { id: sejour.litId }, data: { statut: 'DISPONIBLE' } }),
    ])
    audit(req.user, 'UPDATE', 'Sejour', { recordId: sejour.id, label: `Sortie — Lit ${sejour.lit.numero}` })
    broadcast('hospitalisations')
    sendSuccess(res, updated)
  } catch (err) { next(err) }
})

router.get('/sejours/:id', async (_req, res, next) => {
  try {
    const sejour = await (prisma as any).sejour.findUnique({ where: { id: String(_req.params.id) }, include: sejourInclude })
    if (!sejour) { sendError(res, 'Séjour introuvable', 404); return }
    sendSuccess(res, sejour)
  } catch (err) { next(err) }
})

// ── Transfert de chambre ──────────────────────────────────────────────────────
router.patch('/sejours/:id/transfert', requireRole('ADMIN', 'MEDECIN', 'INFIRMIER'), async (req: AuthRequest, res, next) => {
  try {
    const { litId, raison } = req.body
    if (!litId) { sendError(res, 'Nouveau lit requis', 400); return }

    const sejour = await (prisma as any).sejour.findUnique({ where: { id: String(req.params.id) }, include: { lit: true } })
    if (!sejour) { sendError(res, 'Séjour introuvable', 404); return }
    if (sejour.statut !== 'EN_COURS') { sendError(res, 'Séjour déjà clôturé', 400); return }
    if (sejour.litId === litId) { sendError(res, 'Le patient est déjà dans ce lit', 400); return }

    const newLit = await (prisma as any).lit.findUnique({ where: { id: litId }, include: { chambre: true } })
    if (!newLit) { sendError(res, 'Lit introuvable', 404); return }
    if (newLit.statut !== 'DISPONIBLE') { sendError(res, 'Ce lit n\'est pas disponible', 400); return }

    const noteTransfert = raison
      ? `[Transfert ${new Date().toLocaleDateString('fr-FR')}] ${raison}`
      : `[Transfert ${new Date().toLocaleDateString('fr-FR')}] ${sejour.lit.numero} → ${newLit.numero}`
    const notesUpdated = sejour.notes ? `${sejour.notes}\n${noteTransfert}` : noteTransfert

    const [updated] = await (prisma as any).$transaction([
      (prisma as any).sejour.update({
        where: { id: sejour.id },
        data:  { litId, notes: notesUpdated },
        include: sejourInclude,
      }),
      (prisma as any).lit.update({ where: { id: sejour.litId }, data: { statut: 'DISPONIBLE' } }),
      (prisma as any).lit.update({ where: { id: litId }, data: { statut: 'OCCUPE' } }),
    ])
    audit(req.user, 'UPDATE', 'Sejour', { recordId: sejour.id, label: `Transfert ${sejour.lit.numero} → ${newLit.numero}` })
    broadcast('hospitalisations')
    sendSuccess(res, updated)
  } catch (err) { next(err) }
})

// ── Statistiques d'occupation ─────────────────────────────────────────────────
router.get('/statistiques', async (_req, res, next) => {
  try {
    const now   = new Date()
    const debut30j = new Date(now); debut30j.setDate(debut30j.getDate() - 30)
    const debut7j  = new Date(now); debut7j.setDate(debut7j.getDate() - 7)

    const [totalLits, occupes, sejoursActifs, sejours30j] = await Promise.all([
      (prisma as any).lit.count(),
      (prisma as any).lit.count({ where: { statut: 'OCCUPE' } }),
      (prisma as any).sejour.findMany({
        where: { statut: 'EN_COURS' },
        include: { lit: { include: { chambre: { include: { service: { select: { id: true, nom: true } } } } } } },
      }),
      (prisma as any).sejour.findMany({
        where: { dateAdmission: { gte: debut30j } },
        select: { dateAdmission: true, dateSortie: true, statut: true, litId: true,
          lit: { include: { chambre: { include: { service: { select: { id: true, nom: true } } } } } } },
      }),
    ])

    // Taux d'occupation
    const tauxOccupation = totalLits > 0 ? Math.round((occupes / totalLits) * 100) : 0

    // Durée moyenne des séjours clôturés ce mois (en heures)
    const sejoursTermines = sejours30j.filter((s: any) => s.dateSortie)
    const dureeMoyenneH = sejoursTermines.length > 0
      ? Math.round(sejoursTermines.reduce((acc: number, s: any) =>
          acc + (new Date(s.dateSortie).getTime() - new Date(s.dateAdmission).getTime()) / 3_600_000, 0
        ) / sejoursTermines.length)
      : 0

    // Séjours actifs par service
    const parService: Record<string, { nom: string; count: number }> = {}
    for (const s of sejoursActifs) {
      const svc = s.lit?.chambre?.service
      const key = svc?.id ?? 'sans-service'
      if (!parService[key]) parService[key] = { nom: svc?.nom ?? 'Sans service', count: 0 }
      parService[key].count++
    }

    // Séjours longs (> 7 jours) — nécessitent attention
    const sejoursLongs = sejoursActifs
      .filter((s: any) => (now.getTime() - new Date(s.dateAdmission).getTime()) > 7 * 86_400_000)
      .map((s: any) => ({
        id: s.id, dateAdmission: s.dateAdmission,
        chambre: s.lit?.chambre?.numero, lit: s.lit?.numero,
        joursHospitalises: Math.floor((now.getTime() - new Date(s.dateAdmission).getTime()) / 86_400_000),
      }))

    // Admissions par jour (7 derniers jours)
    const admissionsParJour: { date: string; admissions: number; sorties: number }[] = []
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now); d.setDate(d.getDate() - i)
      const dateStr = d.toISOString().split('T')[0]
      const debutJ = new Date(dateStr); debutJ.setHours(0, 0, 0, 0)
      const finJ   = new Date(dateStr); finJ.setHours(23, 59, 59, 999)
      admissionsParJour.push({
        date: dateStr,
        admissions: sejours30j.filter((s: any) => new Date(s.dateAdmission) >= debutJ && new Date(s.dateAdmission) <= finJ).length,
        sorties:    sejours30j.filter((s: any) => s.dateSortie && new Date(s.dateSortie) >= debutJ && new Date(s.dateSortie) <= finJ).length,
      })
    }

    sendSuccess(res, {
      tauxOccupation, totalLits, occupes,
      sejoursActifsCount: sejoursActifs.length,
      dureeMoyenneH,
      parService: Object.values(parService).sort((a, b) => b.count - a.count),
      sejoursLongs,
      admissionsParJour,
      admissions30j: sejours30j.length,
    })
  } catch (err) { next(err) }
})

// ── Médicaments dus (notifications infirmiers) ────────────────────────────────

router.get('/medicaments-dus', async (_req: AuthRequest, res, next) => {
  try {
    const now = new Date()
    const prescriptions = await (prisma as any).prescription.findMany({
      where: { statut: 'ACTIVE' },
      include: {
        patient: { select: { id: true, prenom: true, nom: true, numero: true } },
        sejour:  { select: { id: true, statut: true } },
        medecin: { select: { id: true, prenom: true, nom: true } },
        administrations: { orderBy: { dateHeure: 'desc' }, take: 1 },
      },
    })
    const dus = prescriptions
      .filter((p: any) => {
        if (p.sejour?.statut !== 'EN_COURS') return false
        const last     = p.administrations[0]
        const base     = last ? new Date(last.dateHeure) : new Date(p.dateDebut)
        const nextDue  = new Date(base.getTime() + p.intervalleH * 3_600_000)
        return nextDue <= now
      })
      .map((p: any) => {
        const last     = p.administrations[0]
        const base     = last ? new Date(last.dateHeure) : new Date(p.dateDebut)
        const nextDue  = new Date(base.getTime() + p.intervalleH * 3_600_000)
        const retardMin = Math.max(0, Math.round((now.getTime() - nextDue.getTime()) / 60_000))
        return { ...p, nextDue: nextDue.toISOString(), retardMin }
      })
    sendSuccess(res, dus)
  } catch (err) { next(err) }
})

// ── Prescriptions ─────────────────────────────────────────────────────────────

const VOIES: Record<string, string> = {
  ORAL: 'Oral', IV: 'Intraveineux', IM: 'Intramusculaire',
  SC: 'Sous-cutané', TOPIQUE: 'Topique', INHALATION: 'Inhalation',
  SUBLINGUALE: 'Sublinguale', RECTALE: 'Rectale',
}

router.get('/sejours/:id/prescriptions', async (req: AuthRequest, res, next) => {
  try {
    const prescriptions = await (prisma as any).prescription.findMany({
      where: { sejourId: String(req.params.id) },
      include: {
        medecin:         { select: { id: true, prenom: true, nom: true } },
        administrations: {
          include: { infirmier: { select: { id: true, prenom: true, nom: true } } },
          orderBy: { dateHeure: 'desc' },
        },
      },
      orderBy: [{ statut: 'asc' }, { createdAt: 'desc' }],
    })
    sendSuccess(res, prescriptions)
  } catch (err) { next(err) }
})

router.post('/sejours/:id/prescriptions', requireRole('ADMIN', 'MEDECIN'), async (req: AuthRequest, res, next) => {
  try {
    const { medicament, dosage, voie, frequence, intervalleH, dureeJours, instructions } = req.body
    if (!medicament?.trim() || !dosage?.trim() || !frequence?.trim()) {
      sendError(res, 'Médicament, dosage et fréquence sont requis', 400); return
    }
    const sejour = await (prisma as any).sejour.findUnique({ where: { id: String(req.params.id) } })
    if (!sejour) { sendError(res, 'Séjour introuvable', 404); return }
    if (sejour.statut !== 'EN_COURS') { sendError(res, 'Séjour déjà clôturé', 400); return }

    const dateFin = dureeJours
      ? new Date(Date.now() + Number(dureeJours) * 86_400_000)
      : null

    const prescription = await (prisma as any).prescription.create({
      data: {
        patientId:    sejour.patientId,
        medecinId:    req.user!.userId,
        sejourId:     sejour.id,
        medicament:   medicament.trim(),
        dosage:       dosage.trim(),
        voie:         voie || 'ORAL',
        frequence:    frequence.trim(),
        intervalleH:  intervalleH ? Number(intervalleH) : 8,
        dureeJours:   dureeJours ? Number(dureeJours) : null,
        instructions: instructions?.trim() || null,
        dateFin,
      },
      include: {
        medecin:         { select: { id: true, prenom: true, nom: true } },
        administrations: { include: { infirmier: { select: { id: true, prenom: true, nom: true } } } },
      },
    })
    audit(req.user, 'CREATE', 'Prescription', { recordId: prescription.id, label: `${medicament} ${dosage}` })
    broadcast('hospitalisations')
    sendSuccess(res, prescription, 201)
  } catch (err) { next(err) }
})

router.patch('/prescriptions/:id/statut', requireRole('ADMIN', 'MEDECIN'), async (req: AuthRequest, res, next) => {
  try {
    const { statut } = req.body
    const allowed = ['ACTIVE', 'SUSPENDUE', 'TERMINEE', 'ANNULEE']
    if (!allowed.includes(statut)) { sendError(res, 'Statut invalide', 400); return }
    const p = await (prisma as any).prescription.update({
      where: { id: String(req.params.id) },
      data:  { statut, ...(statut === 'TERMINEE' || statut === 'ANNULEE' ? { dateFin: new Date() } : {}) },
    })
    broadcast('hospitalisations')
    sendSuccess(res, p)
  } catch (err) { next(err) }
})

// ── Administrations de médicaments (MAR) ─────────────────────────────────────

router.get('/prescriptions/:id/administrations', async (req: AuthRequest, res, next) => {
  try {
    const administrations = await (prisma as any).administration.findMany({
      where:   { prescriptionId: String(req.params.id) },
      include: { infirmier: { select: { id: true, prenom: true, nom: true } } },
      orderBy: { dateHeure: 'desc' },
    })
    sendSuccess(res, administrations)
  } catch (err) { next(err) }
})

router.post('/prescriptions/:id/administrations', requireRole('ADMIN', 'MEDECIN', 'INFIRMIER'), async (req: AuthRequest, res, next) => {
  try {
    const { statut, note, dateHeure } = req.body
    const allowed = ['ADMINISTRE', 'OMIS', 'REFUSE', 'REPORTE']
    if (statut && !allowed.includes(statut)) { sendError(res, 'Statut invalide', 400); return }

    const prescription = await (prisma as any).prescription.findUnique({ where: { id: String(req.params.id) } })
    if (!prescription) { sendError(res, 'Prescription introuvable', 404); return }

    const admin = await (prisma as any).administration.create({
      data: {
        prescriptionId: prescription.id,
        infirmierId:    req.user!.userId,
        statut:         statut || 'ADMINISTRE',
        note:           note?.trim() || null,
        dateHeure:      dateHeure ? new Date(dateHeure) : new Date(),
      },
      include: { infirmier: { select: { id: true, prenom: true, nom: true } } },
    })
    broadcast('hospitalisations')
    sendSuccess(res, admin, 201)
  } catch (err) { next(err) }
})

// ── Soins infirmiers ───────────────────────────────────────────────────────────

router.get('/sejours/:id/soins', async (req: AuthRequest, res, next) => {
  try {
    const soins = await (prisma as any).soinInfirmier.findMany({
      where:   { sejourId: String(req.params.id) },
      include: { infirmier: { select: { id: true, prenom: true, nom: true } } },
      orderBy: { date: 'desc' },
    })
    sendSuccess(res, soins)
  } catch (err) { next(err) }
})

router.post('/sejours/:id/soins', requireRole('ADMIN', 'MEDECIN', 'INFIRMIER'), async (req: AuthRequest, res, next) => {
  try {
    const { date, tension, pouls, temperature, spo2, freqResp, entrees, sorties, douleur, actes, notes } = req.body

    const sejour = await (prisma as any).sejour.findUnique({ where: { id: String(req.params.id) } })
    if (!sejour) { sendError(res, 'Séjour introuvable', 404); return }
    if (sejour.statut !== 'EN_COURS') { sendError(res, 'Séjour déjà clôturé', 400); return }

    const soin = await (prisma as any).soinInfirmier.create({
      data: {
        sejourId:    sejour.id,
        infirmierId: req.user!.userId,
        date:        date ? new Date(date) : new Date(),
        tension:     tension?.trim()  || null,
        pouls:       pouls    ? Number(pouls)       : null,
        temperature: temperature ? Number(temperature) : null,
        spo2:        spo2     ? Number(spo2)        : null,
        freqResp:    freqResp  ? Number(freqResp)   : null,
        entrees:     entrees   ? Number(entrees)    : null,
        sorties:     sorties   ? Number(sorties)    : null,
        douleur:     douleur   ? Math.min(10, Math.max(0, Number(douleur))) : null,
        actes:       Array.isArray(actes) ? actes : null,
        notes:       notes?.trim() || null,
      },
      include: { infirmier: { select: { id: true, prenom: true, nom: true } } },
    })
    broadcast('hospitalisations')
    sendSuccess(res, soin, 201)
  } catch (err) { next(err) }
})

// ── Facturation d'un séjour ────────────────────────────────────────────────────
router.get('/sejours/:id/facture', async (req: AuthRequest, res, next) => {
  try {
    const facture = await (prisma as any).facture.findUnique({
      where: { sejourId: String(req.params.id) },
      include: { lignes: true, paiements: true },
    })
    sendSuccess(res, facture || null)
  } catch (err) { next(err) }
})

router.post('/sejours/:id/facture', requireRole('ADMIN', 'CAISSIER', 'MEDECIN'), async (req: AuthRequest, res, next) => {
  try {
    const sejourId = String(req.params.id)

    const existing = await (prisma as any).facture.findUnique({ where: { sejourId } })
    if (existing) { sendError(res, 'Une facture a déjà été générée pour ce séjour', 409); return }

    const sejour = await (prisma as any).sejour.findUnique({
      where:   { id: sejourId },
      include: {
        lit:   { include: { chambre: true } },
        soins: true,
      },
    })
    if (!sejour) { sendError(res, 'Séjour introuvable', 404); return }

    // Mouvements DISPENSATION de la pharmacie liés aux prescriptions de ce séjour
    const dispensations = await (prisma as any).mouvementStock.findMany({
      where: {
        type:         'DISPENSATION',
        prescription: { sejourId },
      },
      include: {
        medicament:  { select: { nom: true, prixUnitaire: true, unite: true } },
        prescription: { select: { id: true, medicament: true, dosage: true, frequence: true } },
      },
      orderBy: { createdAt: 'asc' },
    })

    const dateAdmission = new Date(sejour.dateAdmission)
    const dateSortie    = sejour.dateSortie ? new Date(sejour.dateSortie) : new Date()
    const nuits         = Math.max(1, Math.ceil((dateSortie.getTime() - dateAdmission.getTime()) / 86_400_000))
    const prixNuit      = PRIX_NUIT[sejour.lit.chambre.type] ?? 1_500

    const lignes: { description: string; quantite: number; prixUnitaire: number; montant: number }[] = []

    // Ligne hospitalisation
    lignes.push({
      description:  `Hospitalisation — Ch. ${sejour.lit.chambre.numero}, Lit ${sejour.lit.numero} (${nuits} nuit${nuits > 1 ? 's' : ''})`,
      quantite:     nuits,
      prixUnitaire: prixNuit,
      montant:      nuits * prixNuit,
    })

    // Lignes médicaments dispensés par la pharmacie uniquement
    // Regrouper par (prescriptionId + medicamentId) pour une ligne par dispensation unique
    const grouped = new Map<string, { description: string; quantite: number; prixUnitaire: number }>()
    for (const mv of dispensations) {
      const key = `${mv.prescriptionId}|${mv.medicamentId}`
      const existing = grouped.get(key)
      if (existing) {
        existing.quantite += mv.quantite
      } else {
        const label = mv.prescription
          ? `${mv.prescription.medicament} ${mv.prescription.dosage ?? ''} — dispensé en pharmacie`
          : `${mv.medicament.nom} — dispensé en pharmacie`
        grouped.set(key, {
          description:  label.trim(),
          quantite:     mv.quantite,
          prixUnitaire: mv.medicament.prixUnitaire ?? 0,
        })
      }
    }
    for (const item of grouped.values()) {
      lignes.push({ ...item, montant: item.quantite * item.prixUnitaire })
    }

    if (dispensations.length === 0) {
      // Aucune dispensation pharmacie — signaler dans une ligne informative à 0
      lignes.push({
        description:  'Médicaments — aucune dispensation enregistrée en pharmacie',
        quantite:     0,
        prixUnitaire: 0,
        montant:      0,
      })
    }

    // Surveillance infirmière
    if (sejour.soins.length > 0) {
      lignes.push({
        description:  `Surveillance infirmière (${sejour.soins.length} feuille${sejour.soins.length > 1 ? 's' : ''} de soins)`,
        quantite:     sejour.soins.length,
        prixUnitaire: 300,
        montant:      sejour.soins.length * 300,
      })
    }

    const montantTotal = lignes.reduce((s, l) => s + l.montant, 0)
    const count        = await prisma.facture.count()
    const numero       = generateNumero('FAC', count)

    const facture = await (prisma as any).facture.create({
      data: {
        numero,
        patientId:    sejour.patientId,
        sejourId,
        montantTotal,
        lignes: { create: lignes },
      },
      include: { lignes: true, patient: { select: { id: true, prenom: true, nom: true } } },
    })

    audit(req.user, 'CREATE', 'Facture', { recordId: facture.id, label: `${facture.numero} — Séjour ${sejourId}` })
    broadcast('factures')
    sendSuccess(res, facture, 201)
  } catch (err) { next(err) }
})

export default router
