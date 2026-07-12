import { Router, Response, NextFunction } from 'express';
import { requireAuth } from '../middleware/auth';
import { requireSupervisor, requireAdmin } from '../middleware/rbac';
import { validate } from '../middleware/validate';
import { envoyerTransfertSchema } from '../validation/tresorerie.schemas';
import { AuthRequest, AppError } from '../types';
import * as ctrl from '../controllers/tresorerie.controller';

const router = Router();

// Un transfert impliquant le siège (agenceSourceId ou agenceDestId absent) est réservé aux admins —
// un transfert agence à agence reste accessible aux superviseurs (déjà vérifié par requireSupervisor)
function requireAdminSiSiege(req: AuthRequest, res: Response, next: NextFunction): void {
  const { agenceSourceId, agenceDestId } = req.body;
  if ((!agenceSourceId || !agenceDestId) && !['SUPER_ADMIN', 'DIRECTEUR'].includes(req.user!.role)) {
    return next(new AppError(403, 'Un transfert impliquant le siège est réservé aux administrateurs'));
  }
  next();
}

router.get('/', requireAuth, ctrl.list);
router.get('/caisse/:agenceId', requireAuth, ctrl.caisseAgence);
router.get('/:id', requireAuth, ctrl.getOne);
router.post('/', requireAuth, requireSupervisor, validate(envoyerTransfertSchema), requireAdminSiSiege, ctrl.envoyer);
router.patch('/:id/confirmer', requireAuth, requireSupervisor, ctrl.confirmer);
router.patch('/:id/annuler', requireAuth, requireAdmin, ctrl.annuler);

export default router;
