import { Response, NextFunction } from 'express'
import { z } from 'zod'
import prisma from '../utils/prisma'
import { sendSuccess, sendError } from '../utils/response'
import { AuthRequest } from '../types'
import { audit } from '../utils/audit'

const tarifSchema = z.object({
  code:       z.string().min(1).max(20),
  libelle:    z.string().min(2),
  categorie:  z.string().optional(),
  prixDefaut: z.number().positive(),
})

export async function getTarifs(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const where = req.query.inactif ? {} : { actif: true }
    const tarifs = await prisma.tarifMedical.findMany({
      where,
      orderBy: [{ categorie: 'asc' }, { libelle: 'asc' }],
    })
    sendSuccess(res, tarifs)
  } catch (err) { next(err) }
}

export async function createTarif(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = tarifSchema.parse(req.body)
    const exists = await prisma.tarifMedical.findUnique({ where: { code: data.code } })
    if (exists) { sendError(res, `Le code "${data.code}" est déjà utilisé`, 409); return }
    const tarif = await prisma.tarifMedical.create({ data })
    audit(req.user, 'CREATE', 'TarifMedical', { recordId: tarif.id, label: tarif.libelle })
    sendSuccess(res, tarif, 201)
  } catch (err) { next(err) }
}

export async function updateTarif(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = tarifSchema.partial().parse(req.body)
    const id = String(req.params.id)
    const exists = await prisma.tarifMedical.findUnique({ where: { id } })
    if (!exists) { sendError(res, 'Tarif non trouvé', 404); return }
    if (data.code && data.code !== exists.code) {
      const dupe = await prisma.tarifMedical.findUnique({ where: { code: data.code } })
      if (dupe) { sendError(res, `Le code "${data.code}" est déjà utilisé`, 409); return }
    }
    const updated = await prisma.tarifMedical.update({ where: { id }, data })
    audit(req.user, 'UPDATE', 'TarifMedical', { recordId: id, label: updated.libelle })
    sendSuccess(res, updated)
  } catch (err) { next(err) }
}

export async function deactivateTarif(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = String(req.params.id)
    const exists = await prisma.tarifMedical.findUnique({ where: { id } })
    if (!exists) { sendError(res, 'Tarif non trouvé', 404); return }
    const updated = await prisma.tarifMedical.update({ where: { id }, data: { actif: false } })
    audit(req.user, 'DELETE', 'TarifMedical', { recordId: id, label: updated.libelle })
    sendSuccess(res, updated)
  } catch (err) { next(err) }
}
