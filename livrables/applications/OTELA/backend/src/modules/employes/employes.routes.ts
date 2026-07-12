import { Router } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import * as ctrl from './employes.controller';
import { validate } from '../../middlewares/validate.middleware';
import { requireAuth } from '../../middlewares/auth.middleware';
import { requireAdministrateurEtablissement } from '../../middlewares/rbac.middleware';
import { creerEmployeSchema, updateEmployeSchema, reinitialiserMotDePasseSchema, listEmployesQuerySchema } from './employes.schemas';

const router = Router();

// requireAdministrateurEtablissement autorise ADMINISTRATEUR_ETABLISSEMENT ET
// ADMINISTRATEUR_CHAINE — le cloisonnement fin (établissement, anti-escalade) vit
// dans employes.service.ts, pas ici.
router.use(requireAuth, requireAdministrateurEtablissement);

router.get('/', validate(listEmployesQuerySchema), asyncHandler(ctrl.listEmployes));
router.post('/', validate(creerEmployeSchema), asyncHandler(ctrl.creerEmploye));
router.patch('/:id', validate(updateEmployeSchema), asyncHandler(ctrl.updateEmploye));
router.post('/:id/reinitialiser-mot-de-passe', validate(reinitialiserMotDePasseSchema), asyncHandler(ctrl.reinitialiserMotDePasse));

export default router;
