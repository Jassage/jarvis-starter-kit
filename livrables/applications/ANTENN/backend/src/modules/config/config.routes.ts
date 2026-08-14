import { Router } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import * as ctrl from './config.controller';
import { validate } from '../../middlewares/validate.middleware';
import { requireAuth } from '../../middlewares/auth.middleware';
import { requireAdministrateur } from '../../middlewares/rbac.middleware';
import { uploadLogoChaine } from '../../middlewares/upload.middleware';
import { updateConfigSchema } from './config.schemas';

const router = Router();

router.use(requireAuth);

// Lecture : les deux rôles (l'opérateur doit voir l'habillage d'antenne en place).
router.get('/', asyncHandler(ctrl.getConfig));

// Écriture : administrateur uniquement. Le nom et le logo permanent sont l'identité
// de la chaîne à l'écran, visible par tous les téléspectateurs en continu — pas un
// réglage d'exploitation quotidienne.
router.patch('/', requireAdministrateur, validate(updateConfigSchema), asyncHandler(ctrl.updateConfig));
router.post('/logo', requireAdministrateur, uploadLogoChaine.single('logo'), asyncHandler(ctrl.uploadLogo));

export default router;
