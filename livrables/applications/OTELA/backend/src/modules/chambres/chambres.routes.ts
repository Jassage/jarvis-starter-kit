import { Router } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import * as ctrl from './chambres.controller';
import { validate } from '../../middlewares/validate.middleware';
import { RoleEmploye } from '@prisma/client';
import { requireAuth } from '../../middlewares/auth.middleware';
import { requireAdministrateurEtablissement, requireRole } from '../../middlewares/rbac.middleware';
import { resolveEtablissement } from '../../middlewares/tenant.middleware';
import { uploadPhotosTypeChambre } from '../../middlewares/upload.middleware';
import {
  createTypeChambreSchema, updateTypeChambreSchema,
  createTarifSchema, updateTarifSchema,
  createChambreSchema, updateChambreSchema,
  modifierPhotoSchema, basculerMaintenanceSchema,
} from './chambres.schemas';

const router = Router();

// Réservée au personnel — le site public passe par /disponibilite (qui combine
// types + tarifs + disponibilité réelle), jamais par cette liste brute.
router.get('/types', requireAuth, resolveEtablissement, asyncHandler(ctrl.listTypes));

router.post('/types', requireAuth, resolveEtablissement, requireAdministrateurEtablissement, validate(createTypeChambreSchema), asyncHandler(ctrl.createType));
router.patch('/types/:id', requireAuth, resolveEtablissement, requireAdministrateurEtablissement, validate(updateTypeChambreSchema), asyncHandler(ctrl.updateType));

router.post('/types/:typeChambreId/tarifs', requireAuth, resolveEtablissement, requireAdministrateurEtablissement, validate(createTarifSchema), asyncHandler(ctrl.createTarif));
router.patch('/tarifs/:id', requireAuth, resolveEtablissement, requireAdministrateurEtablissement, validate(updateTarifSchema), asyncHandler(ctrl.updateTarif));

// Galerie photo du type de chambre. L'upload passe par multer avant le contrôleur ;
// les métadonnées (légendes, ordre, principale) sont modifiées ensuite en JSON.
router.post('/types/:typeChambreId/photos', requireAuth, resolveEtablissement, requireAdministrateurEtablissement, uploadPhotosTypeChambre, asyncHandler(ctrl.ajouterPhotos));
router.patch('/photos/:id', requireAuth, resolveEtablissement, requireAdministrateurEtablissement, validate(modifierPhotoSchema), asyncHandler(ctrl.modifierPhoto));
router.delete('/photos/:id', requireAuth, resolveEtablissement, requireAdministrateurEtablissement, asyncHandler(ctrl.supprimerPhoto));

router.get('/', requireAuth, resolveEtablissement, asyncHandler(ctrl.listChambres));
router.post('/', requireAuth, resolveEtablissement, requireAdministrateurEtablissement, validate(createChambreSchema), asyncHandler(ctrl.createChambre));
// Bascule maintenance montée AVANT /:id pour ne pas être captée par la route générique.
// Ouverte au rôle MAINTENANCE en plus de la direction.
router.patch('/:id/maintenance', requireAuth, resolveEtablissement, requireRole(RoleEmploye.MAINTENANCE, RoleEmploye.ADMINISTRATEUR_ETABLISSEMENT, RoleEmploye.ADMINISTRATEUR_CHAINE), validate(basculerMaintenanceSchema), asyncHandler(ctrl.basculerMaintenance));
router.patch('/:id', requireAuth, resolveEtablissement, requireAdministrateurEtablissement, validate(updateChambreSchema), asyncHandler(ctrl.updateChambre));

export default router;
