import { Response, NextFunction } from 'express'
import { z } from 'zod'
import { ExamenStatut, Prisma } from '@prisma/client'
import prisma from '../utils/prisma'
import { sendSuccess, sendError, generateNumero } from '../utils/response'
import { AuthRequest } from '../types'
import { audit } from '../utils/audit'

const examenSchema = z.object({
  patientId: z.string().uuid(),
  consultationId: z.string().uuid().optional(),
  type: z.string().min(1),
  description: z.string().optional(),
})

const include = {
  patient: { select: { id: true, prenom: true, nom: true, numero: true } },
  medecin: { select: { id: true, prenom: true, nom: true } },
  consultation: { select: { id: true, date: true, diagnostic: true } },
}

export async function createExamen(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = examenSchema.parse(req.body)
    const count = await prisma.examen.count()
    const numero = generateNumero('EXM', count)
    const examen = await prisma.examen.create({
      data: { ...data, medecinId: req.user!.userId, numero },
      include,
    })
    audit(req.user, 'CREATE', 'Examen', { recordId: examen.id, label: `${examen.type} — ${examen.patient.prenom} ${examen.patient.nom}` })
    sendSuccess(res, examen, 201)
  } catch (err) { next(err) }
}

export async function getExamens(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const where: Prisma.ExamenWhereInput = {}
    if (req.query.patientId) where.patientId = String(req.query.patientId)
    if (req.query.consultationId) where.consultationId = String(req.query.consultationId)
    if (req.query.statut) where.statut = String(req.query.statut) as ExamenStatut

    const examens = await prisma.examen.findMany({ where, include, orderBy: { createdAt: 'desc' } })
    sendSuccess(res, examens)
  } catch (err) { next(err) }
}

export async function getExamen(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const examen = await prisma.examen.findUnique({ where: { id: String(req.params.id) }, include })
    if (!examen) { sendError(res, 'Examen non trouvé', 404); return }
    sendSuccess(res, examen)
  } catch (err) { next(err) }
}

export async function updateStatutExamen(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { statut } = z.object({ statut: z.nativeEnum(ExamenStatut) }).parse(req.body)
    const exists = await prisma.examen.findUnique({ where: { id: String(req.params.id) } })
    if (!exists) { sendError(res, 'Examen non trouvé', 404); return }
    if (exists.statut === 'ANNULE') { sendError(res, 'Impossible de modifier un examen annulé', 400); return }
    const examen = await prisma.examen.update({
      where: { id: String(req.params.id) },
      data: { statut },
      include,
    })
    sendSuccess(res, examen)
  } catch (err) { next(err) }
}

export async function saisirResultat(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { resultat, resultatStructure } = z.object({
      resultat: z.string().min(1),
      resultatStructure: z.record(z.string(), z.unknown()).optional(),
    }).parse(req.body)
    const exists = await prisma.examen.findUnique({ where: { id: String(req.params.id) } })
    if (!exists) { sendError(res, 'Examen non trouvé', 404); return }
    if (exists.statut === 'ANNULE') { sendError(res, 'Impossible de saisir un résultat pour un examen annulé', 400); return }
    const examen = await prisma.examen.update({
      where: { id: String(req.params.id) },
      data: {
        resultat,
        statut: 'RESULTAT_DISPONIBLE',
        dateResultat: new Date(),
        ...(resultatStructure !== undefined && { resultatStructure: resultatStructure as Prisma.InputJsonValue }),
      },
      include,
    })
    audit(req.user, 'UPDATE', 'Examen', { recordId: examen.id, label: `Résultat saisi — ${examen.type} — ${examen.patient.prenom} ${examen.patient.nom}` })
    sendSuccess(res, examen)
  } catch (err) { next(err) }
}

export async function annulerExamen(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const exists = await prisma.examen.findUnique({ where: { id: String(req.params.id) } })
    if (!exists) { sendError(res, 'Examen non trouvé', 404); return }
    if (exists.statut === 'RESULTAT_DISPONIBLE') { sendError(res, "Impossible d'annuler un examen avec résultat", 400); return }
    const examen = await prisma.examen.update({
      where: { id: String(req.params.id) },
      data: { statut: 'ANNULE' },
      include,
    })
    sendSuccess(res, examen)
  } catch (err) { next(err) }
}
