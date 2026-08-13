import { Router } from 'express';
import * as inventaireController from './inventaire.controller';
import { validate } from '../../middlewares/validate.middleware';
import { requireAuth } from '../../middlewares/auth.middleware';
import { requireStock, requireGestionCatalogue } from '../../middlewares/rbac.middleware';
import {
  creerInventaireSchema,
  saisirQuantitesSchema,
  idParamSchema,
  listInventairesQuerySchema,
} from './inventaire.schemas';

const router = Router();

router.use(requireAuth);
router.get('/', validate(listInventairesQuerySchema), inventaireController.list);
router.get('/:id', validate(idParamSchema), inventaireController.getById);
router.post('/', requireStock, validate(creerInventaireSchema), inventaireController.creer);
router.patch('/:id/quantites', requireStock, validate(saisirQuantitesSchema), inventaireController.saisirQuantites);
router.post('/:id/annuler', requireStock, validate(idParamSchema), inventaireController.annuler);
// Validation réservée aux rôles de gestion : applique en masse des ajustements de stock,
// même garde que l'annulation de vente (pas un geste de saisie quotidienne).
router.post('/:id/valider', requireGestionCatalogue, validate(idParamSchema), inventaireController.valider);

export default router;
