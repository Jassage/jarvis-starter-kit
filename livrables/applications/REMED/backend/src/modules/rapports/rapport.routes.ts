import { Router } from 'express';
import * as rapportController from './rapport.controller';
import { validate } from '../../middlewares/validate.middleware';
import { requireAuth } from '../../middlewares/auth.middleware';
import { requireGestionCatalogue } from '../../middlewares/rbac.middleware';
import { periodeQuerySchema } from './rapport.schemas';

const router = Router();

// Rapports = données financières/business agrégées, réservées aux rôles de gestion (cohérent
// avec dépenses/retours/validation d'inventaire) — pas au VENDEUR/MAGASINIER.
router.use(requireAuth, requireGestionCatalogue);

router.get('/ventes', validate(periodeQuerySchema), rapportController.ventes);
router.get('/ventes/export.csv', validate(periodeQuerySchema), rapportController.ventesCsv);
router.get('/stock', rapportController.stock);
router.get('/stock/export.csv', rapportController.stockCsv);
router.get('/achats', validate(periodeQuerySchema), rapportController.achats);
router.get('/achats/export.csv', validate(periodeQuerySchema), rapportController.achatsCsv);
router.get('/finance', validate(periodeQuerySchema), rapportController.finance);

export default router;
