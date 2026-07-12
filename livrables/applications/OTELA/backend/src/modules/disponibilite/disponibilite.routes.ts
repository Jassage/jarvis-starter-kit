import { Router } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import * as ctrl from './disponibilite.controller';
import { validate } from '../../middlewares/validate.middleware';
import { searchDisponibiliteSchema } from './disponibilite.schemas';

const router = Router();

// Public — recherche de disponibilité depuis le site de réservation.
router.get('/', validate(searchDisponibiliteSchema), asyncHandler(ctrl.search));

export default router;
