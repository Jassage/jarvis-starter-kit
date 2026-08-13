import { Router } from 'express';
import * as caisseController from './caisse.controller';
import { validate } from '../../middlewares/validate.middleware';
import { requireAuth } from '../../middlewares/auth.middleware';
import { requireVente } from '../../middlewares/rbac.middleware';
import { ouvrirCaisseSchema, fermerCaisseSchema, mouvementCaisseSchema } from './caisse.schemas';

const router = Router();

router.use(requireAuth);
router.get('/active', caisseController.getActive);
router.get('/historique', caisseController.historique);
router.post('/ouvrir', requireVente, validate(ouvrirCaisseSchema), caisseController.ouvrir);
router.post('/:id/fermer', requireVente, validate(fermerCaisseSchema), caisseController.fermer);
router.post('/mouvements', requireVente, validate(mouvementCaisseSchema), caisseController.mouvementManuel);

export default router;
