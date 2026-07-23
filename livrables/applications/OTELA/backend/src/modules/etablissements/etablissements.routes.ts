import { Router } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import * as ctrl from './etablissements.controller';
import { validate } from '../../middlewares/validate.middleware';
import { requireAuth } from '../../middlewares/auth.middleware';
import { requireAdministrateurChaine, requireAdministrateurEtablissement } from '../../middlewares/rbac.middleware';
import { uploadLogoEtablissement } from '../../middlewares/upload.middleware';
import { createEtablissementSchema, updateEtablissementSchema } from './etablissements.schemas';

const router = Router();

// Lecture publique — le site de réservation a besoin de lister les établissements.
router.get('/', asyncHandler(ctrl.list));
router.get('/:id', asyncHandler(ctrl.getOne));
router.get('/:id/vitrine', asyncHandler(ctrl.getVitrine));

// Créer un établissement reste réservé à la chaîne. La modification et le logo sont
// ouverts au directeur d'établissement : le contrôleur (assertPeutModifier) garantit
// qu'un directeur ne touche que son propre établissement.
router.post('/', requireAuth, requireAdministrateurChaine, validate(createEtablissementSchema), asyncHandler(ctrl.create));
router.patch('/:id', requireAuth, requireAdministrateurEtablissement, validate(updateEtablissementSchema), asyncHandler(ctrl.update));
router.post('/:id/logo', requireAuth, requireAdministrateurEtablissement, uploadLogoEtablissement, asyncHandler(ctrl.uploadLogo));

export default router;
