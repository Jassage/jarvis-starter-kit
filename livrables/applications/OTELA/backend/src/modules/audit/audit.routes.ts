import { Router } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import * as ctrl from './audit.controller';
import { validate } from '../../middlewares/validate.middleware';
import { requireAuth } from '../../middlewares/auth.middleware';
import { requireLectureChaine } from '../../middlewares/rbac.middleware';
import { resolveEtablissement } from '../../middlewares/tenant.middleware';
import { listJournalQuerySchema } from './audit.schemas';

const router = Router();

// Le journal est réservé à la direction de la chaîne (super administrateur et
// propriétaire) : il expose les actions de tout le personnel, y compris les
// tentatives de connexion échouées.
router.use(requireAuth, requireLectureChaine, resolveEtablissement);

router.get('/actions', asyncHandler(ctrl.actions));
router.get('/', validate(listJournalQuerySchema), asyncHandler(ctrl.list));

export default router;
