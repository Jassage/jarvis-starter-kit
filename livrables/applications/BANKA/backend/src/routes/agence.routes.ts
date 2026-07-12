import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { requireRole } from '../middleware/rbac';
import { validate } from '../middleware/validate';
import { createAgenceSchema, updateAgenceSchema } from '../validation/agence.schemas';
import * as ctrl from '../controllers/agence.controller';

const router = Router();

router.get('/', requireAuth, ctrl.listAgences);
router.get('/:id', requireAuth, ctrl.getAgence);
router.post('/', requireAuth, requireRole('SUPER_ADMIN'), validate(createAgenceSchema), ctrl.createAgence);
router.put('/:id', requireAuth, requireRole('SUPER_ADMIN'), validate(updateAgenceSchema), ctrl.updateAgence);

export default router;
