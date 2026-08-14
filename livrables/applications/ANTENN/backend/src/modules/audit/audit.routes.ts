import { Router } from 'express';
import { z } from 'zod';
import { asyncHandler } from '../../utils/asyncHandler';
import * as ctrl from './audit.controller';
import { validate } from '../../middlewares/validate.middleware';
import { requireAuth } from '../../middlewares/auth.middleware';
import { requireAdministrateur } from '../../middlewares/rbac.middleware';

const listSchema = z.object({
  query: z.object({
    action: z.string().optional(),
    from: z.string().datetime().optional(),
    to: z.string().datetime().optional(),
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(200).default(50),
  }),
});

const router = Router();

// Lecture seule, administrateur uniquement : le journal sert justement à surveiller
// l'activité des opérateurs. Aucune route d'écriture ni de suppression n'est exposée,
// les entrées sont produites par les services eux-mêmes.
router.get('/', requireAuth, requireAdministrateur, validate(listSchema), asyncHandler(ctrl.list));

export default router;
