import { Router } from 'express';
import * as dashboardController from './dashboard.controller';
import { requireAuth } from '../../middlewares/auth.middleware';
import { validate } from '../../middlewares/validate.middleware';
import { statsPeriodeQuerySchema } from './dashboard.schemas';

const router = Router();

router.use(requireAuth);
router.get('/stats', dashboardController.getStats);
router.get('/stats-periode', validate(statsPeriodeQuerySchema), dashboardController.getStatsPeriode);

export default router;
