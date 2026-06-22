import { Router } from 'express'
import { requireAuth, requireRole } from '../middleware/auth'
import prisma from '../utils/prisma'
import { sendSuccess, sendError, generateNumero } from '../utils/response'
import { audit } from '../utils/audit'
import { broadcast } from '../utils/eventBus'
import { AuthRequest } from '../types'

const router = Router()
router.use(requireAuth)

const p = prisma as any

// ── Catalogue médicaments ─────────────────────────────────────────────────────

router.get('/medicaments', async (req: AuthRequest, res, next) => {
  try {
    const search  = req.query.search ? String(req.query.search) : undefined
    const alerte  = req.query.alerte === 'true'
    const where: any = { actif: true }
    if (search) where.nom = { contains: search, mode: 'insensitive' }

    const meds = await p.medicament.findMany({
      where,
      include: {
        lots:      { where: { quantiteRestante: { gt: 0 } }, orderBy: { datePeremption: 'asc' } },
        _count:    { select: { mouvements: true } },
      },
      orderBy: { nom: 'asc' },
    })

    const result = alerte
      ? meds.filter((m: any) => m.stockActuel <= m.seuilAlerte)
      : meds

    sendSuccess(res, result)
  } catch (err) { next(err) }
})

router.post('/medicaments', requireRole('ADMIN'), async (req: AuthRequest, res, next) => {
  try {
    const { nom, dci, categorie, forme, dosageForme, unite, seuilAlerte, prixUnitaire } = req.body
    if (!nom?.trim()) { sendError(res, 'Nom requis', 400); return }

    const med = await p.medicament.create({
      data: {
        nom:         nom.trim(),
        dci:         dci?.trim()        || null,
        categorie:   categorie?.trim()  || null,
        forme:       forme?.trim()      || null,
        dosageForme: dosageForme?.trim()|| null,
        unite:       unite?.trim()      || 'unité',
        seuilAlerte: seuilAlerte  ? Number(seuilAlerte)  : 10,
        prixUnitaire: prixUnitaire ? Number(prixUnitaire) : null,
      },
    })
    audit(req.user, 'CREATE', 'Medicament', { recordId: med.id, label: med.nom })
    broadcast('pharmacie')
    sendSuccess(res, med, 201)
  } catch (err) { next(err) }
})

router.get('/medicaments/:id', async (req: AuthRequest, res, next) => {
  try {
    const med = await p.medicament.findUnique({
      where:   { id: String(req.params.id) },
      include: {
        lots:      { orderBy: { datePeremption: 'asc' } },
        mouvements: {
          include: { user: { select: { prenom: true, nom: true, role: true } } },
          orderBy: { createdAt: 'desc' },
          take: 50,
        },
      },
    })
    if (!med) { sendError(res, 'Médicament introuvable', 404); return }
    sendSuccess(res, med)
  } catch (err) { next(err) }
})

router.patch('/medicaments/:id', requireRole('ADMIN'), async (req: AuthRequest, res, next) => {
  try {
    const { nom, dci, categorie, forme, dosageForme, unite, seuilAlerte, prixUnitaire, actif } = req.body
    const med = await p.medicament.update({
      where: { id: String(req.params.id) },
      data: {
        ...(nom         && { nom: nom.trim() }),
        ...(dci         !== undefined && { dci: dci?.trim() || null }),
        ...(categorie   !== undefined && { categorie: categorie?.trim() || null }),
        ...(forme       !== undefined && { forme: forme?.trim() || null }),
        ...(dosageForme !== undefined && { dosageForme: dosageForme?.trim() || null }),
        ...(unite       && { unite: unite.trim() }),
        ...(seuilAlerte  !== undefined && { seuilAlerte: Number(seuilAlerte) }),
        ...(prixUnitaire !== undefined && { prixUnitaire: prixUnitaire ? Number(prixUnitaire) : null }),
        ...(actif        !== undefined && { actif }),
      },
    })
    broadcast('pharmacie')
    sendSuccess(res, med)
  } catch (err) { next(err) }
})

// ── Lots ──────────────────────────────────────────────────────────────────────

router.post('/medicaments/:id/lots', requireRole('ADMIN', 'INFIRMIER'), async (req: AuthRequest, res, next) => {
  try {
    const { numero, quantite, datePeremption, fournisseur } = req.body
    if (!numero?.trim() || !quantite) { sendError(res, 'Numéro et quantité requis', 400); return }

    const qte = Number(quantite)
    const med = await p.medicament.findUnique({ where: { id: String(req.params.id) } })
    if (!med) { sendError(res, 'Médicament introuvable', 404); return }

    const [lot] = await p.$transaction([
      p.lotMedicament.create({
        data: {
          medicamentId:     med.id,
          numero:           numero.trim(),
          quantiteInitiale: qte,
          quantiteRestante: qte,
          datePeremption:   datePeremption ? new Date(datePeremption) : null,
          fournisseur:      fournisseur?.trim() || null,
        },
      }),
      p.mouvementStock.create({
        data: {
          medicamentId: med.id,
          userId:       req.user!.userId,
          type:         'ENTREE',
          quantite:     qte,
          raison:       `Réception lot ${numero}${fournisseur ? ` (${fournisseur})` : ''}`,
        },
      }),
      p.medicament.update({
        where: { id: med.id },
        data:  { stockActuel: { increment: qte } },
      }),
    ])
    broadcast('pharmacie')
    sendSuccess(res, lot, 201)
  } catch (err) { next(err) }
})

// ── Mouvements de stock ───────────────────────────────────────────────────────

router.post('/mouvements', requireRole('ADMIN', 'INFIRMIER', 'MEDECIN'), async (req: AuthRequest, res, next) => {
  try {
    const { medicamentId, type, quantite, raison } = req.body
    if (!medicamentId || !type || !quantite) { sendError(res, 'Médicament, type et quantité requis', 400); return }
    const typesValides = ['ENTREE', 'SORTIE', 'AJUSTEMENT', 'PEREMPTION']
    if (!typesValides.includes(type)) { sendError(res, 'Type invalide', 400); return }

    const qte = Number(quantite)
    const med = await p.medicament.findUnique({ where: { id: medicamentId } })
    if (!med) { sendError(res, 'Médicament introuvable', 404); return }

    const delta = ['SORTIE', 'PEREMPTION'].includes(type) ? -qte : type === 'AJUSTEMENT' ? qte : qte
    if (med.stockActuel + delta < 0) { sendError(res, 'Stock insuffisant', 400); return }

    await p.$transaction([
      p.mouvementStock.create({
        data: { medicamentId, userId: req.user!.userId, type, quantite: qte, raison: raison?.trim() || null },
      }),
      p.medicament.update({
        where: { id: medicamentId },
        data:  { stockActuel: { increment: delta } },
      }),
    ])
    broadcast('pharmacie')
    sendSuccess(res, { ok: true })
  } catch (err) { next(err) }
})

// ── Dispensation liée à une prescription ─────────────────────────────────────

router.post('/dispenser/:prescriptionId', requireRole('ADMIN', 'INFIRMIER', 'MEDECIN'), async (req: AuthRequest, res, next) => {
  try {
    const { medicamentId, quantite } = req.body
    if (!medicamentId || !quantite) { sendError(res, 'Médicament et quantité requis', 400); return }

    const prescription = await p.prescription.findUnique({ where: { id: String(req.params.prescriptionId) } })
    if (!prescription) { sendError(res, 'Prescription introuvable', 404); return }

    const med = await p.medicament.findUnique({ where: { id: medicamentId } })
    if (!med) { sendError(res, 'Médicament introuvable', 404); return }

    const qte = Number(quantite)
    if (med.stockActuel < qte) { sendError(res, `Stock insuffisant : ${med.stockActuel} ${med.unite} disponible(s)`, 400); return }

    await p.$transaction([
      p.mouvementStock.create({
        data: {
          medicamentId,
          userId:        req.user!.userId,
          type:          'DISPENSATION',
          quantite:      qte,
          prescriptionId: prescription.id,
          raison: `Dispensation — ${prescription.medicament} ${prescription.dosage}`,
        },
      }),
      p.medicament.update({
        where: { id: medicamentId },
        data:  { stockActuel: { decrement: qte } },
      }),
    ])
    broadcast('pharmacie')
    sendSuccess(res, { ok: true, stockRestant: med.stockActuel - qte })
  } catch (err) { next(err) }
})

// ── Dispensation directe (patients ambulatoires) ──────────────────────────────

router.post('/dispenser-direct', requireRole('ADMIN', 'INFIRMIER', 'MEDECIN'), async (req: AuthRequest, res, next) => {
  try {
    const { medicamentId, quantite, raison } = req.body
    if (!medicamentId || !quantite) { sendError(res, 'Médicament et quantité requis', 400); return }

    const med = await p.medicament.findUnique({ where: { id: medicamentId } })
    if (!med) { sendError(res, 'Médicament introuvable', 404); return }

    const qte = Number(quantite)
    if (qte <= 0) { sendError(res, 'Quantité invalide', 400); return }
    if (med.stockActuel < qte) { sendError(res, `Stock insuffisant : ${med.stockActuel} ${med.unite} disponible(s)`, 400); return }

    await p.$transaction([
      p.mouvementStock.create({
        data: {
          medicamentId,
          userId:  req.user!.userId,
          type:    'DISPENSATION',
          quantite: qte,
          raison:  raison?.trim() || 'Dispensation directe — patient ambulatoire',
        },
      }),
      p.medicament.update({
        where: { id: medicamentId },
        data:  { stockActuel: { decrement: qte } },
      }),
    ])
    broadcast('pharmacie')
    sendSuccess(res, { ok: true, stockRestant: med.stockActuel - qte })
  } catch (err) { next(err) }
})

// ── Alertes ───────────────────────────────────────────────────────────────────

router.get('/alertes', async (_req, res, next) => {
  try {
    const now     = new Date()
    const dans30j = new Date(now); dans30j.setDate(dans30j.getDate() + 30)

    const [ruptureStock, lotsPerimanent, lotsPerimes] = await Promise.all([
      p.medicament.findMany({
        where: { actif: true },
        orderBy: { stockActuel: 'asc' },
      }),
      p.lotMedicament.findMany({
        where: { datePeremption: { gte: now, lte: dans30j }, quantiteRestante: { gt: 0 } },
        include: { medicament: { select: { id: true, nom: true, unite: true } } },
        orderBy: { datePeremption: 'asc' },
      }),
      p.lotMedicament.findMany({
        where: { datePeremption: { lt: now }, quantiteRestante: { gt: 0 } },
        include: { medicament: { select: { id: true, nom: true, unite: true } } },
        orderBy: { datePeremption: 'asc' },
      }),
    ])

    const ruptureFiltered = ruptureStock.filter((m: any) => m.stockActuel <= m.seuilAlerte)
    sendSuccess(res, {
      ruptureStock:   ruptureFiltered,
      lotsPerimanent,
      lotsPerimes,
      total: ruptureFiltered.length + lotsPerimes.length,
    })
  } catch (err) { next(err) }
})

// ── Commandes fournisseurs ────────────────────────────────────────────────────

router.get('/commandes', async (_req, res, next) => {
  try {
    const commandes = await p.commandeFournisseur.findMany({
      include: {
        lignes: {
          include: { medicament: { select: { id: true, nom: true, unite: true } } },
        },
      },
      orderBy: { createdAt: 'desc' },
    })
    sendSuccess(res, commandes)
  } catch (err) { next(err) }
})

router.post('/commandes', requireRole('ADMIN'), async (req: AuthRequest, res, next) => {
  try {
    const { fournisseur, dateLivraisonPrevue, notes, lignes } = req.body
    if (!fournisseur?.trim()) { sendError(res, 'Fournisseur requis', 400); return }
    if (!Array.isArray(lignes) || lignes.length === 0) { sendError(res, 'Au moins une ligne requise', 400); return }

    const count   = await p.commandeFournisseur.count()
    const numero  = generateNumero('CMD', count)

    const commande = await p.commandeFournisseur.create({
      data: {
        numero,
        fournisseur: fournisseur.trim(),
        dateLivraisonPrevue: dateLivraisonPrevue ? new Date(dateLivraisonPrevue) : null,
        notes: notes?.trim() || null,
        lignes: {
          create: lignes.map((l: any) => ({
            medicamentId:     l.medicamentId,
            quantiteCommandee: Number(l.quantiteCommandee),
            prixUnitaire:     l.prixUnitaire ? Number(l.prixUnitaire) : null,
          })),
        },
      },
      include: { lignes: { include: { medicament: { select: { id: true, nom: true } } } } },
    })
    audit(req.user, 'CREATE', 'CommandeFournisseur', { recordId: commande.id, label: `${commande.numero} — ${fournisseur}` })
    sendSuccess(res, commande, 201)
  } catch (err) { next(err) }
})

router.patch('/commandes/:id', requireRole('ADMIN'), async (req: AuthRequest, res, next) => {
  try {
    const { statut, lignesRecues } = req.body
    const allowed = ['BROUILLON', 'ENVOYE', 'RECU_PARTIEL', 'RECU', 'ANNULE']
    if (!allowed.includes(statut)) { sendError(res, 'Statut invalide', 400); return }

    const commande = await p.commandeFournisseur.findUnique({
      where:   { id: String(req.params.id) },
      include: { lignes: { include: { medicament: true } } },
    })
    if (!commande) { sendError(res, 'Commande introuvable', 404); return }

    // Si réception, mettre à jour stock
    if ((statut === 'RECU' || statut === 'RECU_PARTIEL') && Array.isArray(lignesRecues)) {
      await p.$transaction(
        lignesRecues.flatMap((lr: any) => {
          const qte = Number(lr.quantiteRecue) || 0
          if (qte <= 0) return []
          return [
            p.ligneCommande.update({
              where: { id: lr.id },
              data:  { quantiteRecue: qte },
            }),
            p.mouvementStock.create({
              data: {
                medicamentId: lr.medicamentId,
                userId:       req.user!.userId,
                type:         'ENTREE',
                quantite:     qte,
                raison:       `Réception commande ${commande.numero}`,
              },
            }),
            p.medicament.update({
              where: { id: lr.medicamentId },
              data:  { stockActuel: { increment: qte } },
            }),
          ]
        })
      )
    }

    const updated = await p.commandeFournisseur.update({
      where: { id: commande.id },
      data:  { statut },
      include: { lignes: { include: { medicament: { select: { id: true, nom: true } } } } },
    })
    broadcast('pharmacie')
    sendSuccess(res, updated)
  } catch (err) { next(err) }
})

// ── Prescriptions actives (pour dispensation) ─────────────────────────────────

router.get('/prescriptions-actives', async (_req, res, next) => {
  try {
    const prescriptions = await p.prescription.findMany({
      where: {
        statut: 'ACTIVE',
        sejour: { statut: 'EN_COURS' },
      },
      include: {
        patient: { select: { id: true, prenom: true, nom: true, numero: true } },
        medecin: { select: { prenom: true, nom: true } },
        sejour:  { include: { lit: { include: { chambre: { select: { numero: true } } } } } },
        mouvementsStock: { orderBy: { createdAt: 'desc' }, take: 1 },
      },
      orderBy: { createdAt: 'desc' },
    })
    sendSuccess(res, prescriptions)
  } catch (err) { next(err) }
})

export default router
