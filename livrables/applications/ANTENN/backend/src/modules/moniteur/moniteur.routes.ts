import { Router } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import * as ctrl from './moniteur.controller';
import { requireAuth } from '../../middlewares/auth.middleware';

const router = Router();

// Écran d'accueil de la régie : les deux rôles en ont besoin.
router.get('/', requireAuth, asyncHandler(ctrl.get));

export default router;
