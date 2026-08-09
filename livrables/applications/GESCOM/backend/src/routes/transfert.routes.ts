import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { requireStock } from '../middleware/rbac';
import { validate } from '../middleware/validate';
import { scopeEmplacementQuery, requireOwnEmplacementBody } from '../middleware/emplacementScope';
import { createTransfertSchema } from '../validation/transfert.schemas';
import * as ctrl from '../controllers/transfert.controller';

const router = Router();

router.get('/', requireAuth, scopeEmplacementQuery(), ctrl.list);
// Un VENDEUR/MAGASINIER ne peut initier un transfert QUE depuis son propre site (la source
// est là où le stock est décrémenté) — la réception à l'autre bout reste vérifiée séparément.
router.post('/', requireAuth, requireStock, validate(createTransfertSchema), requireOwnEmplacementBody('emplacementSourceId'), ctrl.create);
router.patch('/:id/recevoir', requireAuth, requireStock, ctrl.recevoir);
router.patch('/:id/annuler', requireAuth, requireStock, ctrl.annuler);

export default router;
