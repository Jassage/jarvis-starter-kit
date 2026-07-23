import { Router } from 'express';
import { RoleEmploye } from '@prisma/client';
import { asyncHandler } from '../../utils/asyncHandler';
import * as ctrl from './maintenance.controller';
import { validate } from '../../middlewares/validate.middleware';
import { requireAuth } from '../../middlewares/auth.middleware';
import { requireRole } from '../../middlewares/rbac.middleware';
import { resolveEtablissement } from '../../middlewares/tenant.middleware';
import { creerTicketSchema, updateTicketSchema, listTicketsQuerySchema } from './maintenance.schemas';

const router = Router();

router.use(requireAuth, resolveEtablissement);

// Signalement ouvert à tout opérationnel — n'importe qui peut repérer un problème,
// pas seulement le rôle Maintenance.
const ROLES_SIGNALEMENT = [RoleEmploye.RECEPTION, RoleEmploye.MENAGE, RoleEmploye.MAINTENANCE, RoleEmploye.ADMINISTRATEUR_ETABLISSEMENT];
// Mise à jour (statut, assignation, résolution) réservée à Maintenance et la direction —
// même trio que la bascule /chambres/:id/maintenance existante.
const ROLES_GESTION = [RoleEmploye.MAINTENANCE, RoleEmploye.ADMINISTRATEUR_ETABLISSEMENT, RoleEmploye.ADMINISTRATEUR_CHAINE];
// Lecture : union des deux — l'admin chaîne qui peut mettre à jour doit aussi pouvoir lister.
const ROLES_LECTURE = [...ROLES_SIGNALEMENT, RoleEmploye.ADMINISTRATEUR_CHAINE];

router.get('/tickets', requireRole(...ROLES_LECTURE), validate(listTicketsQuerySchema), asyncHandler(ctrl.listTickets));
router.get('/employes', requireRole(...ROLES_LECTURE), asyncHandler(ctrl.listEmployesMaintenance));
router.post('/tickets', requireRole(...ROLES_SIGNALEMENT), validate(creerTicketSchema), asyncHandler(ctrl.creerTicket));
router.patch('/tickets/:id', requireRole(...ROLES_GESTION), validate(updateTicketSchema), asyncHandler(ctrl.updateTicket));

export default router;
