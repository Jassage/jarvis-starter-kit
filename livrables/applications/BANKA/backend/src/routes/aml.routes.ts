import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { requireRole } from '../middleware/rbac';
import { listAlertesAML, traiterAlerteAML } from '../services/aml.service';
import { ok } from '../types';

const router = Router();

router.get('/', requireAuth, requireRole('AUDITEUR', 'SUPERVISEUR', 'DIRECTEUR', 'SUPER_ADMIN'), async (req: any, res: any, next: any) => {
  try {
    const { statut, page, limit } = req.query as Record<string, string>;
    const result = await listAlertesAML({ statut, page: page ? parseInt(page) : 1, limit: limit ? parseInt(limit) : 50 });
    res.json(ok(result));
  } catch (e) { next(e); }
});

router.patch('/:id/traiter', requireAuth, requireRole('AUDITEUR', 'SUPERVISEUR', 'DIRECTEUR', 'SUPER_ADMIN'), async (req: any, res: any, next: any) => {
  try {
    const alerte = await traiterAlerteAML(req.params.id, req.user!.userId);
    res.json(ok(alerte, 'Alerte marquée comme traitée'));
  } catch (e) { next(e); }
});

export default router;
