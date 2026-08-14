import { Router } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import * as ctrl from './replay.controller';
import { validate } from '../../middlewares/validate.middleware';
import { requireAuth } from '../../middlewares/auth.middleware';
import { requireAdministrateur } from '../../middlewares/rbac.middleware';
import { uploadVignette } from '../../middlewares/upload.middleware';
import {
  createReplaySchema,
  createDepuisCreneauSchema,
  updateReplaySchema,
  idParamSchema,
  catalogueQuerySchema,
} from './replay.schemas';

// Router mixte : le catalogue et la lecture sont publics (comme /epg), la gestion
// est réservée à la régie. Les routes /admin sont déclarées AVANT `/:id` pour ne pas
// être capturées par le paramètre.
const router = Router();

// ── Régie (les deux rôles, comme Contenus/Grille/Config) ──
router.get('/admin', requireAuth, asyncHandler(ctrl.listAdmin));
router.get('/admin/creneaux-replayables', requireAuth, asyncHandler(ctrl.creneauxReplayables));
router.get('/admin/:id', requireAuth, validate(idParamSchema), asyncHandler(ctrl.getOne));

router.post('/', requireAuth, validate(createReplaySchema), asyncHandler(ctrl.create));
router.post(
  '/depuis-creneau/:creneauId',
  requireAuth,
  validate(createDepuisCreneauSchema),
  asyncHandler(ctrl.createDepuisCreneau)
);
router.patch('/:id', requireAuth, validate(updateReplaySchema), asyncHandler(ctrl.update));
router.post('/:id/vignette', requireAuth, uploadVignette.single('vignette'), asyncHandler(ctrl.uploadVignette));
router.post('/:id/publier', requireAuth, validate(idParamSchema), asyncHandler(ctrl.publier));
router.post('/:id/retirer', requireAuth, validate(idParamSchema), asyncHandler(ctrl.retirer));
// Suppression définitive réservée à l'administrateur : retirer du catalogue (statut
// RETIRE) suffit à l'exploitation courante et reste réversible, alors qu'un delete
// efface aussi les vues accumulées, qui comptent dans le rapport sponsor.
router.delete('/:id', requireAuth, requireAdministrateur, validate(idParamSchema), asyncHandler(ctrl.remove));

// ── Public (sans auth) ──
// Le comptage des vues n'est plus ici : il passe par POST /api/audience/ping, qui
// déduplique par session (cf. replay.service).
router.get('/', validate(catalogueQuerySchema), asyncHandler(ctrl.catalogue));
router.get('/:id', validate(idParamSchema), asyncHandler(ctrl.detailPublic));

export default router;
