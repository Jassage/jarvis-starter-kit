import { Router } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import * as ctrl from './replay.controller';
import { validate } from '../../middlewares/validate.middleware';
import { requireAuth } from '../../middlewares/auth.middleware';
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
router.delete('/:id', requireAuth, validate(idParamSchema), asyncHandler(ctrl.remove));

// ── Public (sans auth) ──
router.get('/', validate(catalogueQuerySchema), asyncHandler(ctrl.catalogue));
router.post('/:id/vue', validate(idParamSchema), asyncHandler(ctrl.compterVue));
router.get('/:id', validate(idParamSchema), asyncHandler(ctrl.detailPublic));

export default router;
