import { Router } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import * as ctrl from './reservations.controller';
import { validate } from '../../middlewares/validate.middleware';
import { requireAuth } from '../../middlewares/auth.middleware';
import { resolveEtablissement } from '../../middlewares/tenant.middleware';
import { reservationLimiter } from '../../middlewares/rateLimiter.middleware';
import { creerReservationSchema, listReservationsQuerySchema } from './reservations.schemas';

const router = Router();

// Volontairement non authentifiée — le site public réserve sans compte. Le
// back-office appelle exactement cette même route (même service, même garde
// anti-double-booking) pour une création manuelle : jamais deux chemins de code.
router.post('/', reservationLimiter, validate(creerReservationSchema), asyncHandler(ctrl.create));

router.get('/', requireAuth, resolveEtablissement, validate(listReservationsQuerySchema), asyncHandler(ctrl.list));
router.get('/:id', requireAuth, resolveEtablissement, asyncHandler(ctrl.getOne));
router.patch('/:id/annuler', requireAuth, resolveEtablissement, asyncHandler(ctrl.annuler));

export default router;
