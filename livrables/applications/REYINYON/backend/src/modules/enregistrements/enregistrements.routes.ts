import { Router } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import * as ctrl from './enregistrements.controller';
import { requireAuth } from '../../middlewares/auth.middleware';
import { resolveReunion, requireHote } from '../../middlewares/reunion.middleware';

// Monté sous /api/reunions/:codeReunion/enregistrements — l'enregistrement
// est une action hôte uniquement, jamais accessible à un simple participant.
const router = Router({ mergeParams: true });

router.use(requireAuth, resolveReunion('codeReunion'), requireHote);
router.post('/demarrer', asyncHandler(ctrl.demarrer));
router.post('/arreter', asyncHandler(ctrl.arreter));
router.get('/en-cours', asyncHandler(ctrl.enCours));
router.get('/', asyncHandler(ctrl.lister));

export default router;
