import { Router } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import * as ctrl from './telephony.controller';

// Endpoints publics appelés par Twilio (webhooks) — authentifiés par
// signature Twilio (X-Twilio-Signature), pas par requireAuth.
const router = Router();

router.post('/accueil', asyncHandler(ctrl.accueil));
router.post('/valider', asyncHandler(ctrl.valider));

export default router;
