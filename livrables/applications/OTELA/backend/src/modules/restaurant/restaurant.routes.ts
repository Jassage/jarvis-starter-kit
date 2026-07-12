import { Router } from 'express';
import { RoleEmploye } from '@prisma/client';
import { asyncHandler } from '../../utils/asyncHandler';
import * as ctrl from './restaurant.controller';
import { validate } from '../../middlewares/validate.middleware';
import { requireAuth } from '../../middlewares/auth.middleware';
import { requireRole } from '../../middlewares/rbac.middleware';
import { resolveEtablissement } from '../../middlewares/tenant.middleware';
import {
  creerPointDeVenteSchema,
  creerTableSchema,
  creerMenuItemSchema,
  updateMenuItemSchema,
  ouvrirCommandeSchema,
  ajouterLigneCommandeSchema,
  cloturerCommandeSchema,
} from './restaurant.schemas';

const router = Router();
const SERVEUR_OU_ADMIN = [RoleEmploye.SERVEUR, RoleEmploye.ADMINISTRATEUR_ETABLISSEMENT] as const;
const ADMIN_SEUL = [RoleEmploye.ADMINISTRATEUR_ETABLISSEMENT] as const;

router.use(requireAuth, resolveEtablissement, requireRole(...SERVEUR_OU_ADMIN));

// Points de vente / tables / menu — lecture ouverte au serveur (POS), écriture admin.
router.get('/points-de-vente', asyncHandler(ctrl.listPointsDeVente));
router.post('/points-de-vente', requireRole(...ADMIN_SEUL), validate(creerPointDeVenteSchema), asyncHandler(ctrl.creerPointDeVente));

router.get('/tables', asyncHandler(ctrl.listTables));
router.post('/tables', requireRole(...ADMIN_SEUL), validate(creerTableSchema), asyncHandler(ctrl.creerTable));

router.get('/menu', asyncHandler(ctrl.listMenu));
router.post('/menu', requireRole(...ADMIN_SEUL), validate(creerMenuItemSchema), asyncHandler(ctrl.creerMenuItem));
router.patch('/menu/:id', requireRole(...ADMIN_SEUL), validate(updateMenuItemSchema), asyncHandler(ctrl.updateMenuItem));

// Commandes — serveur + admin établissement. "/commandes/cuisine" AVANT
// "/commandes/:id" (sinon Express matcherait "cuisine" comme un id de commande).
router.post('/commandes', validate(ouvrirCommandeSchema), asyncHandler(ctrl.ouvrirCommande));
router.get('/commandes/cuisine', asyncHandler(ctrl.listCommandesCuisine));
router.get('/commandes/:id', asyncHandler(ctrl.getCommande));
router.post('/commandes/:id/lignes', validate(ajouterLigneCommandeSchema), asyncHandler(ctrl.ajouterLigneCommande));
router.patch('/commandes/:id/envoyer-cuisine', asyncHandler(ctrl.envoyerEnCuisine));
router.patch('/commandes/:id/servir', asyncHandler(ctrl.marquerServie));
router.post('/commandes/:id/cloturer', validate(cloturerCommandeSchema), asyncHandler(ctrl.cloturerCommande));

export default router;
