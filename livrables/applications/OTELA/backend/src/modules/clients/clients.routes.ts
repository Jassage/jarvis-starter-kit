import { Router } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import * as ctrl from './clients.controller';
import { requireAuth } from '../../middlewares/auth.middleware';

const router = Router();

// Historique client multi-établissements — réservé au personnel (RGPD minimal).
router.get('/:id', requireAuth, asyncHandler(ctrl.getOne));

export default router;
