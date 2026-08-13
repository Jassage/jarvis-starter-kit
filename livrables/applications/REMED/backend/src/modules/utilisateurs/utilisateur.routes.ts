import { Router } from 'express';
import * as utilisateurController from './utilisateur.controller';
import { validate } from '../../middlewares/validate.middleware';
import { requireAuth } from '../../middlewares/auth.middleware';
import { requireAdmin } from '../../middlewares/rbac.middleware';
import { creerUtilisateurSchema, updateUtilisateurSchema, resetPasswordSchema } from './utilisateur.schemas';

const router = Router();

// Gestion des comptes réservée à SUPER_ADMIN/GERANT (requireAdmin) — jamais au personnel
// opérationnel (PHARMACIEN/VENDEUR/MAGASINIER), y compris pour la simple lecture de la liste.
router.use(requireAuth, requireAdmin);

router.get('/', utilisateurController.list);
router.post('/', validate(creerUtilisateurSchema), utilisateurController.creer);
router.patch('/:id', validate(updateUtilisateurSchema), utilisateurController.update);
router.post('/:id/reset-password', validate(resetPasswordSchema), utilisateurController.resetPassword);

export default router;
