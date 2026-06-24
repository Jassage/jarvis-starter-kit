import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { requireRole } from '../middleware/rbac';
import * as ctrl from '../controllers/agence.controller';

const router = Router();

router.get('/', requireAuth, ctrl.listAgences);
router.get('/:id', requireAuth, ctrl.getAgence);
router.post('/', requireAuth, requireRole('SUPER_ADMIN'), ctrl.createAgence);
router.put('/:id', requireAuth, requireRole('SUPER_ADMIN'), ctrl.updateAgence);

export default router;
