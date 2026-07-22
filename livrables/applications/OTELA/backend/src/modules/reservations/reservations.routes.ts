import { Router } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import * as ctrl from './reservations.controller';
import { validate } from '../../middlewares/validate.middleware';
import { requireAuth } from '../../middlewares/auth.middleware';
import { resolveEtablissement } from '../../middlewares/tenant.middleware';
import { reservationLimiter } from '../../middlewares/rateLimiter.middleware';
import * as facturesCtrl from '../factures/factures.controller';
import { creerReservationSchema, listReservationsQuerySchema, consultationPubliqueSchema } from './reservations.schemas';

const router = Router();

// Volontairement non authentifiée — le site public réserve sans compte. Le
// back-office appelle exactement cette même route (même service, même garde
// anti-double-booking) pour une création manuelle : jamais deux chemins de code.
router.post('/', reservationLimiter, validate(creerReservationSchema), asyncHandler(ctrl.create));

// Consultation publique par référence + email — montée AVANT /:id pour que la
// référence "public" ne soit pas capturée comme un id de réservation.
router.get('/public/:reference', validate(consultationPubliqueSchema), asyncHandler(ctrl.consultationPublique));
router.get('/public/:reference/facture.pdf', validate(consultationPubliqueSchema), asyncHandler(facturesCtrl.getFacturePdfPublic));

router.get('/', requireAuth, resolveEtablissement, validate(listReservationsQuerySchema), asyncHandler(ctrl.list));
router.get('/:id', requireAuth, resolveEtablissement, asyncHandler(ctrl.getOne));
router.patch('/:id/annuler', requireAuth, resolveEtablissement, asyncHandler(ctrl.annuler));

export default router;
