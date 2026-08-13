import { Router } from 'express';
import * as ordonnanceController from './ordonnance.controller';
import { validate } from '../../middlewares/validate.middleware';
import { requireAuth } from '../../middlewares/auth.middleware';
import { requireGestionCatalogue } from '../../middlewares/rbac.middleware';
import { uploadPieceJointe } from '../../middlewares/upload.middleware';
import { creerOrdonnanceSchema, idParamSchema, listOrdonnancesQuerySchema } from './ordonnance.schemas';

const router = Router();

router.use(requireAuth);
// Lecture ouverte à tout connecté (y compris VENDEUR) : le POS a besoin de sélectionner une
// ordonnance existante pour une vente. Écriture réservée aux rôles de gestion (le PHARMACIEN
// « valide les ordonnances », cf. commentaire de l'enum Role) — pas au vendeur lui-même.
router.get('/', validate(listOrdonnancesQuerySchema), ordonnanceController.list);
router.get('/disponibles', ordonnanceController.listDisponibles);
router.get('/:id', validate(idParamSchema), ordonnanceController.getById);
router.post('/', requireGestionCatalogue, validate(creerOrdonnanceSchema), ordonnanceController.creer);
router.post('/:id/annuler', requireGestionCatalogue, validate(idParamSchema), ordonnanceController.annuler);
router.post('/:id/piece-jointe', requireGestionCatalogue, validate(idParamSchema), uploadPieceJointe, ordonnanceController.uploaderPieceJointe);

export default router;
