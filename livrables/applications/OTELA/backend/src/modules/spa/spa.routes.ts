import { Router } from 'express';
import { RoleEmploye } from '@prisma/client';
import { asyncHandler } from '../../utils/asyncHandler';
import * as ctrl from './spa.controller';
import { validate } from '../../middlewares/validate.middleware';
import { requireAuth } from '../../middlewares/auth.middleware';
import { requireRole } from '../../middlewares/rbac.middleware';
import { resolveEtablissement } from '../../middlewares/tenant.middleware';
import {
  creerServiceSpaSchema,
  updateServiceSpaSchema,
  creerPraticienSchema,
  updatePraticienSchema,
  creerRendezVousSchema,
  terminerRendezVousSchema,
} from './spa.schemas';

const router = Router();
const RECEPTION_OU_ADMIN = [RoleEmploye.RECEPTION, RoleEmploye.ADMINISTRATEUR_ETABLISSEMENT] as const;
const ADMIN_SEUL = [RoleEmploye.ADMINISTRATEUR_ETABLISSEMENT] as const;

router.use(requireAuth, resolveEtablissement, requireRole(...RECEPTION_OU_ADMIN));

// Services / praticiens — lecture ouverte à la réception, écriture admin seul.
router.get('/services', asyncHandler(ctrl.listServices));
router.post('/services', requireRole(...ADMIN_SEUL), validate(creerServiceSpaSchema), asyncHandler(ctrl.creerService));
router.patch('/services/:id', requireRole(...ADMIN_SEUL), validate(updateServiceSpaSchema), asyncHandler(ctrl.updateService));

router.get('/praticiens', asyncHandler(ctrl.listPraticiens));
router.post('/praticiens', requireRole(...ADMIN_SEUL), validate(creerPraticienSchema), asyncHandler(ctrl.creerPraticien));
router.patch('/praticiens/:id', requireRole(...ADMIN_SEUL), validate(updatePraticienSchema), asyncHandler(ctrl.updatePraticien));

// Rendez-vous — réception + admin établissement.
router.get('/rendezvous', asyncHandler(ctrl.listRendezVous));
router.post('/rendezvous', validate(creerRendezVousSchema), asyncHandler(ctrl.creerRendezVous));
router.patch('/rendezvous/:id/annuler', asyncHandler(ctrl.annulerRendezVous));
router.post('/rendezvous/:id/terminer', validate(terminerRendezVousSchema), asyncHandler(ctrl.terminerRendezVous));

export default router;
