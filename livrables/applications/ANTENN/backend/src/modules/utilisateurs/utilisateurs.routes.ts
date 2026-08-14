import { Router } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import * as ctrl from './utilisateurs.controller';
import { validate } from '../../middlewares/validate.middleware';
import { requireAuth } from '../../middlewares/auth.middleware';
import { requireAdministrateur } from '../../middlewares/rbac.middleware';
import { createUtilisateurSchema, updateUtilisateurSchema, idParamSchema } from './utilisateurs.schemas';

const router = Router();

// Gestion des comptes : administrateur uniquement, de bout en bout. Un opérateur ne
// doit pas pouvoir se promouvoir ni créer un compte.
router.use(requireAuth, requireAdministrateur);

router.get('/', asyncHandler(ctrl.list));
router.get('/roles', ctrl.roles);
router.get('/:id', validate(idParamSchema), asyncHandler(ctrl.getOne));
router.post('/', validate(createUtilisateurSchema), asyncHandler(ctrl.create));
router.patch('/:id', validate(updateUtilisateurSchema), asyncHandler(ctrl.update));
router.post('/:id/lien-reinitialisation', validate(idParamSchema), asyncHandler(ctrl.genererLienReset));

// Pas de suppression de compte, volontairement : elle viderait le lien entre les
// entrées du journal d'audit et leur auteur. La désactivation (isActive) coupe l'accès
// tout en conservant l'historique.

export default router;
