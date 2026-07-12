import { Router, Request, Response, NextFunction } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import * as ctrl from './messages.controller';
import { validate } from '../../middlewares/validate.middleware';
import { envoyerMessageSchema, historiqueMessageSchema } from './messages.schemas';
import { uploadChat } from '../../config/upload';
import { AppError } from '../../middlewares/errorHandler.middleware';

// multer appelle son callback avec une Error brute (type refusé, fichier trop
// gros) — convertie ici en AppError pour un vrai 422 au lieu du 500 générique.
function uploadPhotoOuAudio(req: Request, res: Response, next: NextFunction) {
  uploadChat.single('fichier')(req, res, (err) => {
    if (err) return next(new AppError(err.message || 'Fichier invalide', 422));
    next();
  });
}

const router = Router({ mergeParams: true });

router.post('/', validate(envoyerMessageSchema), asyncHandler(ctrl.envoyer));
router.post('/media', uploadPhotoOuAudio, asyncHandler(ctrl.envoyerMedia));
router.get('/', validate(historiqueMessageSchema), asyncHandler(ctrl.lister));

export default router;
