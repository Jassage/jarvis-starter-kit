import { Router } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import * as ctrl from './epg.controller';

// Public, sans auth — consommé par le player web
const router = Router();

router.get('/', asyncHandler(ctrl.getEpg));
router.get('/guide', asyncHandler(ctrl.getGuide));

export default router;
