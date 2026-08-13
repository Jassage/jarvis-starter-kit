import { Router } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import * as ctrl from './newsletter.controller';
import { validate } from '../../middlewares/validate.middleware';
import { requireAuth } from '../../middlewares/auth.middleware';
import { requireAdmin } from '../../middlewares/rbac.middleware';
import { formulairePublicLimiter } from '../../middlewares/rateLimiter.middleware';
import {
  subscribeNewsletterSchema,
  listAbonnesNewsletterSchema,
  removeAbonneNewsletterSchema,
  envoyerCampagneSchema,
} from './newsletter.schemas';

const router = Router();

// Public : bandeau newsletter, aucune authentification requise pour s'inscrire.
router.post('/', formulairePublicLimiter, validate(subscribeNewsletterSchema), asyncHandler(ctrl.subscribe));

// Admin : liste + export CSV (pas d'envoi de campagne, cf. plan).
router.get('/', requireAuth, requireAdmin, validate(listAbonnesNewsletterSchema), asyncHandler(ctrl.list));
router.get('/export', requireAuth, requireAdmin, asyncHandler(ctrl.exportCsv));
router.post('/envoyer', requireAuth, requireAdmin, validate(envoyerCampagneSchema), asyncHandler(ctrl.envoyerCampagne));
router.delete('/:id', requireAuth, requireAdmin, validate(removeAbonneNewsletterSchema), asyncHandler(ctrl.remove));

export default router;
