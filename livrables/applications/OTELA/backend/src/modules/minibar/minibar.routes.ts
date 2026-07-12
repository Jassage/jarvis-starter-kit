import { Router } from 'express';
import { RoleEmploye } from '@prisma/client';
import { asyncHandler } from '../../utils/asyncHandler';
import * as ctrl from './minibar.controller';
import { validate } from '../../middlewares/validate.middleware';
import { requireAuth } from '../../middlewares/auth.middleware';
import { requireRole } from '../../middlewares/rbac.middleware';
import { resolveEtablissement } from '../../middlewares/tenant.middleware';
import { creerArticleSchema, constaterConsommationSchema } from './minibar.schemas';

const router = Router();
const MENAGE_OU_ADMIN = [RoleEmploye.MENAGE, RoleEmploye.ADMINISTRATEUR_ETABLISSEMENT] as const;
const ADMIN_SEUL = [RoleEmploye.ADMINISTRATEUR_ETABLISSEMENT] as const;

router.use(requireAuth, resolveEtablissement, requireRole(...MENAGE_OU_ADMIN));

router.get('/articles', asyncHandler(ctrl.listArticles));
router.post('/articles', requireRole(...ADMIN_SEUL), validate(creerArticleSchema), asyncHandler(ctrl.creerArticle));

router.get('/consommations', asyncHandler(ctrl.listConsommations));
router.post('/consommations', validate(constaterConsommationSchema), asyncHandler(ctrl.constaterConsommation));

export default router;
