import { Router } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import * as ctrl from './habillage.controller';
import { validate } from '../../middlewares/validate.middleware';
import { requireAuth } from '../../middlewares/auth.middleware';
import { createIncrustationSchema, createBandeauSchema, idParamSchema } from './habillage.schemas';

const router = Router();

router.use(requireAuth);

router.get('/incrustations', asyncHandler(ctrl.listIncrustations));
router.post('/incrustations', validate(createIncrustationSchema), asyncHandler(ctrl.createIncrustation));
router.delete('/incrustations/:id', validate(idParamSchema), asyncHandler(ctrl.removeIncrustation));

router.get('/bandeaux', asyncHandler(ctrl.listBandeaux));
router.post('/bandeaux', validate(createBandeauSchema), asyncHandler(ctrl.createBandeau));
router.delete('/bandeaux/:id', validate(idParamSchema), asyncHandler(ctrl.removeBandeau));

export default router;
