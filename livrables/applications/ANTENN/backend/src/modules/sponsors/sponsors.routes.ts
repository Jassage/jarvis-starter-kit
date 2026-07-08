import { Router } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import * as ctrl from './sponsors.controller';
import { validate } from '../../middlewares/validate.middleware';
import { requireAuth } from '../../middlewares/auth.middleware';
import { requireAdministrateur } from '../../middlewares/rbac.middleware';
import { uploadLogo } from '../../middlewares/upload.middleware';
import { createSponsorSchema, updateSponsorSchema, idParamSchema } from './sponsors.schemas';

const router = Router();

router.use(requireAuth);

// Lecture : les deux rôles (l'opérateur régie doit voir les sponsors pour l'habillage)
router.get('/', asyncHandler(ctrl.list));
router.get('/alertes/contrats', asyncHandler(ctrl.contratsExpirantBientot));
router.get('/:id', validate(idParamSchema), asyncHandler(ctrl.getOne));

// Écriture (contrats) : administrateur uniquement
router.post('/', requireAdministrateur, validate(createSponsorSchema), asyncHandler(ctrl.create));
router.patch('/:id', requireAdministrateur, validate(updateSponsorSchema), asyncHandler(ctrl.update));
router.delete('/:id', requireAdministrateur, validate(idParamSchema), asyncHandler(ctrl.remove));
router.post('/:id/logo', requireAdministrateur, validate(idParamSchema), uploadLogo.single('logo'), asyncHandler(ctrl.uploadLogo));

export default router;
