import { Router } from 'express';
import * as venteController from './vente.controller';
import { validate } from '../../middlewares/validate.middleware';
import { requireAuth } from '../../middlewares/auth.middleware';
import { requireVente, requireGestionCatalogue } from '../../middlewares/rbac.middleware';
import { creerVenteSchema, annulerVenteSchema, listVentesQuerySchema } from './vente.schemas';

const router = Router();

router.use(requireAuth);
router.get('/', validate(listVentesQuerySchema), venteController.list);
router.get('/:id', venteController.getById);
router.get('/:id/facture.pdf', venteController.facturePdf);
router.post('/', requireVente, validate(creerVenteSchema), venteController.creer);
// Annulation réservée à un rôle de gestion (pas au vendeur lui-même) — règle métier :
// pas de modification arbitraire d'une vente finalisée, seule l'annulation tracée est permise.
router.post('/:id/annuler', requireGestionCatalogue, validate(annulerVenteSchema), venteController.annuler);

export default router;
