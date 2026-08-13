import { Router } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import * as ctrl from './contact.controller';
import { validate } from '../../middlewares/validate.middleware';
import { requireAuth } from '../../middlewares/auth.middleware';
import { requireAdmin } from '../../middlewares/rbac.middleware';
import { formulairePublicLimiter } from '../../middlewares/rateLimiter.middleware';
import {
  createMessageContactSchema,
  listMessagesContactSchema,
  updateStatutMessageContactSchema,
  deleteMessageContactSchema,
} from './contact.schemas';

const router = Router();

// Public : formulaire de contact, aucune authentification requise pour écrire.
router.post('/', formulairePublicLimiter, validate(createMessageContactSchema), asyncHandler(ctrl.create));

// Admin : lecture et traitement des messages reçus.
router.get('/', requireAuth, requireAdmin, validate(listMessagesContactSchema), asyncHandler(ctrl.list));
router.put('/:id/statut', requireAuth, requireAdmin, validate(updateStatutMessageContactSchema), asyncHandler(ctrl.updateStatut));
router.delete('/:id', requireAuth, requireAdmin, validate(deleteMessageContactSchema), asyncHandler(ctrl.remove));

export default router;
