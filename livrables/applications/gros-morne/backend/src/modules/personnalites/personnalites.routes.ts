import { Router } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import * as ctrl from './personnalites.controller';
import { validate } from '../../middlewares/validate.middleware';
import { requireAuth } from '../../middlewares/auth.middleware';
import { requireAdmin } from '../../middlewares/rbac.middleware';
import {
  listPersonnalitesSchema,
  getPersonnaliteSchema,
  createPersonnaliteSchema,
  updatePersonnaliteSchema,
  deletePersonnaliteSchema,
  creerEtapeSchema,
  modifierEtapeSchema,
  supprimerEtapeSchema,
  ajouterPhotoSchema,
  supprimerPhotoSchema,
} from './personnalites.schemas';

const router = Router();

// Public : la page /personnalites (liste) et la fiche détail consomment ces routes sans authentification.
router.get('/', validate(listPersonnalitesSchema), asyncHandler(ctrl.list));
router.get('/:id', validate(getPersonnaliteSchema), asyncHandler(ctrl.getById));

router.post('/', requireAuth, requireAdmin, validate(createPersonnaliteSchema), asyncHandler(ctrl.create));
router.put('/:id', requireAuth, requireAdmin, validate(updatePersonnaliteSchema), asyncHandler(ctrl.update));
router.delete('/:id', requireAuth, requireAdmin, validate(deletePersonnaliteSchema), asyncHandler(ctrl.remove));

// Onglet "Parcours"
router.post('/:id/etapes', requireAuth, requireAdmin, validate(creerEtapeSchema), asyncHandler(ctrl.ajouterEtape));
router.put('/etapes/:etapeId', requireAuth, requireAdmin, validate(modifierEtapeSchema), asyncHandler(ctrl.modifierEtape));
router.delete('/etapes/:etapeId', requireAuth, requireAdmin, validate(supprimerEtapeSchema), asyncHandler(ctrl.supprimerEtape));

// Onglet "Galerie"
router.post('/:id/photos', requireAuth, requireAdmin, validate(ajouterPhotoSchema), asyncHandler(ctrl.ajouterPhoto));
router.delete('/photos/:photoId', requireAuth, requireAdmin, validate(supprimerPhotoSchema), asyncHandler(ctrl.supprimerPhoto));

export default router;
