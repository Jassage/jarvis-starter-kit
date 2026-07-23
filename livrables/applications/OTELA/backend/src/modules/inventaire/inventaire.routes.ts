import { Router } from 'express';
import { RoleEmploye } from '@prisma/client';
import { asyncHandler } from '../../utils/asyncHandler';
import * as ctrl from './inventaire.controller';
import { validate } from '../../middlewares/validate.middleware';
import { requireAuth } from '../../middlewares/auth.middleware';
import { requireRole } from '../../middlewares/rbac.middleware';
import { resolveEtablissement } from '../../middlewares/tenant.middleware';
import { creerArticleSchema, updateArticleSchema, enregistrerMouvementSchema } from './inventaire.schemas';

const router = Router();

router.use(requireAuth, resolveEtablissement);

// Lecture + mouvements (consommation/réassort quotidien) ouverts aux rôles qui
// utilisent réellement le stock au jour le jour.
const ROLES_USAGE = [RoleEmploye.MENAGE, RoleEmploye.MAINTENANCE, RoleEmploye.ADMINISTRATEUR_ETABLISSEMENT, RoleEmploye.ADMINISTRATEUR_CHAINE];
// Gestion du catalogue d'articles (création, seuil d'alerte) réservée à la direction.
const ROLES_GESTION = [RoleEmploye.ADMINISTRATEUR_ETABLISSEMENT, RoleEmploye.ADMINISTRATEUR_CHAINE];

router.get('/articles', requireRole(...ROLES_USAGE), asyncHandler(ctrl.listArticles));
router.post('/articles', requireRole(...ROLES_GESTION), validate(creerArticleSchema), asyncHandler(ctrl.creerArticle));
router.patch('/articles/:id', requireRole(...ROLES_GESTION), validate(updateArticleSchema), asyncHandler(ctrl.updateArticle));

router.get('/articles/:articleId/mouvements', requireRole(...ROLES_USAGE), asyncHandler(ctrl.listMouvements));
router.post('/articles/:articleId/mouvements', requireRole(...ROLES_USAGE), validate(enregistrerMouvementSchema), asyncHandler(ctrl.enregistrerMouvement));

export default router;
