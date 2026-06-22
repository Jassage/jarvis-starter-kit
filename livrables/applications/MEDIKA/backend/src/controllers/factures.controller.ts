import { Response, NextFunction } from 'express'
import { z } from 'zod'
import { MethodePaiement, Prisma } from '@prisma/client'
import prisma from '../utils/prisma'
import { sendSuccess, sendError, generateNumero } from '../utils/response'
import { AuthRequest } from '../types'
import { audit } from '../utils/audit'

const factureSchema = z.object({
  patientId: z.string().uuid(),
  consultationId: z.string().uuid().optional(),
  lignes: z.array(z.object({
    description: z.string().min(1),
    quantite: z.number().int().positive().default(1),
    prixUnitaire: z.number().positive()
  })).min(1)
})

const paiementSchema = z.object({
  montant: z.number().positive(),
  methode: z.nativeEnum(MethodePaiement),
  reference: z.string().optional()
})

const include = {
  patient: { select: { id: true, prenom: true, nom: true, numero: true } },
  lignes: true,
  paiements: true
}

export async function createFacture(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { patientId, consultationId, lignes } = factureSchema.parse(req.body)
    const montantTotal = lignes.reduce((sum, l) => sum + l.quantite * l.prixUnitaire, 0)
    const count = await prisma.facture.count()
    const numero = generateNumero('FAC', count)

    const facture = await prisma.facture.create({
      data: {
        numero,
        patientId,
        consultationId,
        montantTotal,
        lignes: { create: lignes.map(l => ({ ...l, montant: l.quantite * l.prixUnitaire })) }
      },
      include
    })
    audit(req.user, 'CREATE', 'Facture', { recordId: facture.id, label: `${facture.numero} — ${facture.patient.prenom} ${facture.patient.nom} — ${montantTotal} HTG` })
    sendSuccess(res, facture, 201)
  } catch (err) {
    next(err)
  }
}

export async function getFactures(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const where: Prisma.FactureWhereInput = {}
    if (req.query.statut) where.statut = String(req.query.statut) as Prisma.EnumFactureStatutFilter
    if (req.query.patientId) where.patientId = String(req.query.patientId)

    const factures = await prisma.facture.findMany({ where, include, orderBy: { createdAt: 'desc' } })
    sendSuccess(res, factures)
  } catch (err) {
    next(err)
  }
}

export async function getFacture(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const facture = await prisma.facture.findUnique({ where: { id: String(req.params.id) }, include })
    if (!facture) { sendError(res, 'Facture non trouvée', 404); return }
    sendSuccess(res, facture)
  } catch (err) {
    next(err)
  }
}

export async function addPaiement(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { montant, methode, reference } = paiementSchema.parse(req.body)
    const facture = await prisma.facture.findUnique({ where: { id: String(req.params.id) } })
    if (!facture) { sendError(res, 'Facture non trouvée', 404); return }
    if (facture.statut === 'PAYE') { sendError(res, 'Cette facture est déjà entièrement payée', 400); return }
    if (facture.statut === 'ANNULE') { sendError(res, 'Impossible d\'encaisser une facture annulée', 400); return }

    const restant = facture.montantTotal - facture.montantPaye
    if (montant > restant + 0.01) {
      sendError(res, `Montant trop élevé — reste à payer : ${restant.toLocaleString('fr-FR')} HTG`, 400)
      return
    }

    const nouveauMontantPaye = facture.montantPaye + montant
    const statut = nouveauMontantPaye >= facture.montantTotal ? 'PAYE' : 'PARTIELLEMENT_PAYE'

    const [, updated] = await prisma.$transaction([
      prisma.paiement.create({
        data: { factureId: facture.id, montant, methode, reference, caissierI: req.user!.userId }
      }),
      prisma.facture.update({
        where: { id: facture.id },
        data: { montantPaye: nouveauMontantPaye, statut },
        include
      })
    ])

    audit(req.user, 'UPDATE', 'Facture', { recordId: facture.id, label: `Paiement ${montant} HTG (${methode}) — ${facture.numero} — statut: ${statut}` })
    sendSuccess(res, updated)
  } catch (err) {
    next(err)
  }
}

export async function annulerFacture(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const facture = await prisma.facture.findUnique({ where: { id: String(req.params.id) } })
    if (!facture) { sendError(res, 'Facture non trouvée', 404); return }
    if (facture.statut === 'PAYE') { sendError(res, 'Impossible d\'annuler une facture déjà payée', 400); return }
    const updated = await prisma.facture.update({
      where: { id: String(req.params.id) },
      data: { statut: 'ANNULE' },
      include
    })
    sendSuccess(res, updated)
  } catch (err) { next(err) }
}

export async function getImpayés(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const factures = await prisma.facture.findMany({
      where: { statut: { in: ['EN_ATTENTE', 'PARTIELLEMENT_PAYE'] } },
      include,
      orderBy: { createdAt: 'asc' }
    })
    sendSuccess(res, factures)
  } catch (err) {
    next(err)
  }
}
