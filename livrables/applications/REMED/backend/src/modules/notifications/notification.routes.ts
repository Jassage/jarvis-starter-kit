import { Router } from 'express';
import * as notificationController from './notification.controller';
import { validate } from '../../middlewares/validate.middleware';
import { requireAuth } from '../../middlewares/auth.middleware';
import { listNotificationsQuerySchema, idParamSchema } from './notification.schemas';

const router = Router();

router.use(requireAuth);
router.get('/', validate(listNotificationsQuerySchema), notificationController.list);
router.get('/non-lues/compteur', notificationController.compterNonLues);
router.patch('/:id/lue', validate(idParamSchema), notificationController.marquerLue);
router.post('/tout-lire', notificationController.toutMarquerLu);

export default router;
