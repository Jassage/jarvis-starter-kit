import { Router } from 'express'
import { requireAuth } from '../middleware/auth'
import prisma from '../utils/prisma'
import { sendSuccess } from '../utils/response'
import { AuthRequest } from '../types'

const router = Router()
router.use(requireAuth)

router.get('/', async (req: AuthRequest, res, next) => {
  try {
    const q = String(req.query.q || '').trim()
    if (q.length < 2) { sendSuccess(res, { patients: [], factures: [], examens: [] }); return }

    const [patients, factures, examens] = await Promise.all([
      prisma.patient.findMany({
        where: {
          actif: true,
          OR: [
            { prenom: { contains: q, mode: 'insensitive' } },
            { nom:    { contains: q, mode: 'insensitive' } },
            { numero: { contains: q, mode: 'insensitive' } },
            { telephone: { contains: q } },
          ],
        },
        select: {
          id: true, prenom: true, nom: true, numero: true,
          dateNaissance: true, sexe: true, telephone: true,
        },
        orderBy: { createdAt: 'desc' },
        take: 6,
      }),

      prisma.facture.findMany({
        where: {
          OR: [
            { numero: { contains: q, mode: 'insensitive' } },
            { patient: { prenom: { contains: q, mode: 'insensitive' } } },
            { patient: { nom:    { contains: q, mode: 'insensitive' } } },
          ],
        },
        select: {
          id: true, numero: true, statut: true, montantTotal: true, montantPaye: true, createdAt: true,
          patient: { select: { id: true, prenom: true, nom: true, numero: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 4,
      }),

      prisma.examen.findMany({
        where: {
          OR: [
            { type:    { contains: q, mode: 'insensitive' } },
            { patient: { prenom: { contains: q, mode: 'insensitive' } } },
            { patient: { nom:    { contains: q, mode: 'insensitive' } } },
          ],
        },
        select: {
          id: true, type: true, statut: true, createdAt: true,
          patient: { select: { id: true, prenom: true, nom: true } },
          medecin: { select: { prenom: true, nom: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 4,
      }),
    ])

    sendSuccess(res, { patients, factures, examens })
  } catch (err) { next(err) }
})

export default router
