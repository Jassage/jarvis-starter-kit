import { Router } from 'express';
import { Response } from 'express';
import * as categorieService from './categorie.service';
import { validate } from '../../middlewares/validate.middleware';
import { requireAuth } from '../../middlewares/auth.middleware';
import { requireGestionCatalogue } from '../../middlewares/rbac.middleware';
import { createCategorieSchema } from './produit.schemas';
import { sendSuccess } from '../../utils/response';
import { AuthRequest } from '../../types';
import { asyncHandler } from '../../utils/asyncHandler';
import { logAudit } from '../../utils/audit';

const router = Router();

router.use(requireAuth);

router.get(
  '/',
  asyncHandler(async (req: AuthRequest, res: Response) => {
    sendSuccess(res, await categorieService.list(req.user!.pharmacieId));
  })
);

router.post(
  '/',
  requireGestionCatalogue,
  validate(createCategorieSchema),
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const categorie = await categorieService.create(req.user!.pharmacieId, req.body);
    await logAudit({ req, action: 'CREATION', entite: 'Categorie', entiteId: categorie.id });
    sendSuccess(res, categorie, 'Catégorie créée', 201);
  })
);

export default router;
