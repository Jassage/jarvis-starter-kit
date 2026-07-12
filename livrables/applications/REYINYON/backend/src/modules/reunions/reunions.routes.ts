import { Router } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import * as ctrl from './reunions.controller';
import { requireAuth } from '../../middlewares/auth.middleware';
import { resolveReunion, requireHote } from '../../middlewares/reunion.middleware';
import { validate } from '../../middlewares/validate.middleware';
import { creerReunionSchema, verrouillerSchema } from './reunions.schemas';

const router = Router();

router.post('/', requireAuth, validate(creerReunionSchema), asyncHandler(ctrl.creer));
router.get('/', requireAuth, asyncHandler(ctrl.mesReunions));
router.get('/:codeReunion/public', asyncHandler(ctrl.vuePublique));

router.get('/:codeReunion/detail', requireAuth, resolveReunion('codeReunion'), requireHote, asyncHandler(ctrl.detailHote));
router.patch('/:codeReunion/verrouiller', requireAuth, resolveReunion('codeReunion'), requireHote, validate(verrouillerSchema), asyncHandler(ctrl.verrouiller));
router.patch('/:codeReunion/demarrer', requireAuth, resolveReunion('codeReunion'), requireHote, asyncHandler(ctrl.demarrer));
router.patch('/:codeReunion/terminer', requireAuth, resolveReunion('codeReunion'), requireHote, asyncHandler(ctrl.terminer));

export default router;
