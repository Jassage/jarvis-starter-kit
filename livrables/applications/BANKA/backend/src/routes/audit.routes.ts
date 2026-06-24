import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { requireAdmin } from '../middleware/rbac';
import prisma from '../utils/prisma';
import { ok } from '../types';

const router = Router();

router.get('/', requireAuth, requireAdmin, async (req: any, res: any, next: any) => {
  try {
    const { table, action, userId, page = '1', limit = '50' } = req.query as Record<string, string>;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const where: any = {};
    if (table) where.table = table;
    if (action) where.action = { contains: action, mode: 'insensitive' };
    if (userId) where.utilisateurId = userId;

    const [total, items] = await Promise.all([
      prisma.auditLog.count({ where }),
      prisma.auditLog.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
        include: {
          utilisateur: { select: { nom: true, prenom: true, role: true } },
        },
      }),
    ]);

    res.json(ok({ items, total, pages: Math.ceil(total / parseInt(limit)) }));
  } catch (e) { next(e); }
});

export default router;
