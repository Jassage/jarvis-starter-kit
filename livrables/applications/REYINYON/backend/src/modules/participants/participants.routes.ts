import { Router } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import * as ctrl from './participants.controller';
import { requireAuth, optionalAuth } from '../../middlewares/auth.middleware';
import { resolveReunion, requireHote } from '../../middlewares/reunion.middleware';
import { requireHoteDuParticipant } from './participants.middleware';
import { validate } from '../../middlewares/validate.middleware';
import { rejoindreLimiter } from '../../middlewares/rateLimiter.middleware';
import { rejoindreSchema, quitterSchema } from './participants.schemas';

// Monté à la racine /api (pas /api/participants) car ce module couvre à la
// fois /reunions/:codeReunion/rejoindre|attente et /participants/:id/*.
const router = Router();

router.post(
  '/reunions/:codeReunion/rejoindre',
  rejoindreLimiter,
  optionalAuth,
  validate(rejoindreSchema),
  asyncHandler(ctrl.rejoindre)
);
router.get(
  '/reunions/:codeReunion/attente',
  requireAuth,
  resolveReunion('codeReunion'),
  requireHote,
  asyncHandler(ctrl.attente)
);

router.get('/participants/:participantId/statut', asyncHandler(ctrl.statutAttente));
// Départ volontaire — auth légère par reconnectToken (comme le chat), pas
// requireAuth : un invité sans compte doit pouvoir quitter proprement.
router.post('/participants/:participantId/quitter', validate(quitterSchema), asyncHandler(ctrl.quitter));
router.patch('/participants/:participantId/admettre', requireAuth, requireHoteDuParticipant, asyncHandler(ctrl.admettre));
router.patch('/participants/:participantId/rejeter', requireAuth, requireHoteDuParticipant, asyncHandler(ctrl.rejeter));
router.post('/participants/:participantId/muter', requireAuth, requireHoteDuParticipant, asyncHandler(ctrl.couperMicro));
router.post('/participants/:participantId/couper-camera', requireAuth, requireHoteDuParticipant, asyncHandler(ctrl.couperCamera));
router.post('/participants/:participantId/retirer', requireAuth, requireHoteDuParticipant, asyncHandler(ctrl.retirer));

export default router;
