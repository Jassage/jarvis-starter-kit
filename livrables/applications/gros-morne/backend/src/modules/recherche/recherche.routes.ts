import { Router } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import * as ctrl from './recherche.controller';
import { validate } from '../../middlewares/validate.middleware';
import { rechercheSchema } from './recherche.schemas';

const router = Router();

router.get('/', validate(rechercheSchema), asyncHandler(ctrl.rechercher));

export default router;
