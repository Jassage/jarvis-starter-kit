import { Router } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import * as ctrl from './audience.controller';
import { validate } from '../../middlewares/validate.middleware';
import { requireAuth } from '../../middlewares/auth.middleware';
import { audienceLimiter } from '../../middlewares/rateLimiter.middleware';
import { pingSchema } from './audience.schemas';

const router = Router();

// Public : émis par les players web et mobile, qui ne sont jamais authentifiés.
router.post('/ping', audienceLimiter, validate(pingSchema), asyncHandler(ctrl.ping));

// Régie : les deux rôles peuvent consulter l'audience du direct et forcer la
// génération des preuves de diffusion (opération idempotente, sans effet de bord).
router.post('/synchroniser', requireAuth, asyncHandler(ctrl.synchroniser));
router.get('/direct', requireAuth, asyncHandler(ctrl.direct));

export default router;
