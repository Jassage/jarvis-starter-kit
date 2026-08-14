import { Router } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import * as ctrl from './habillage.controller';
import { validate } from '../../middlewares/validate.middleware';
import { requireAuth } from '../../middlewares/auth.middleware';
import { requireAdministrateur } from '../../middlewares/rbac.middleware';
import { createIncrustationSchema, createBandeauSchema, idParamSchema } from './habillage.schemas';

const router = Router();

router.use(requireAuth);

// L'habillage est l'exécution matérielle du contrat sponsor : c'est ce pour quoi le
// sponsor paie. D'où la coupure de droits à cet endroit précis :
//   - poser un habillage relève de l'exploitation quotidienne (les deux rôles),
//   - le retirer prive un sponsor d'une exposition due, donc administrateur seul.
// Toutes ces actions sont tracées au journal d'audit, quel que soit le rôle.
router.get('/incrustations', asyncHandler(ctrl.listIncrustations));
router.post('/incrustations', validate(createIncrustationSchema), asyncHandler(ctrl.createIncrustation));
router.delete('/incrustations/:id', requireAdministrateur, validate(idParamSchema), asyncHandler(ctrl.removeIncrustation));

router.get('/bandeaux', asyncHandler(ctrl.listBandeaux));
router.post('/bandeaux', validate(createBandeauSchema), asyncHandler(ctrl.createBandeau));
router.delete('/bandeaux/:id', requireAdministrateur, validate(idParamSchema), asyncHandler(ctrl.removeBandeau));

export default router;
