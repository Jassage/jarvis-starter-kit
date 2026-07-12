import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { requireAdmin, requireComptable, requireRole } from '../middleware/rbac';
import { validate } from '../middleware/validate';
import { createCompteComptableSchema, updateCompteComptableSchema } from '../validation/compta.schemas';
import { cloturerPeriodeSchema, rouvrirPeriodeSchema } from '../validation/cloture.schemas';
import * as ctrl from '../controllers/compta.controller';
import * as clotureCtrl from '../controllers/cloture.controller';

const router = Router();

// B7: Lecture réservée aux comptables, superviseurs, directeurs et admins
router.get('/dashboard',             requireAuth, requireComptable, ctrl.dashboard);
router.get('/plan-comptable',        requireAuth, requireComptable, ctrl.planComptable);
router.get('/journal',               requireAuth, requireComptable, ctrl.journal);
router.get('/grand-livre',           requireAuth, requireComptable, ctrl.grandLivre);
router.get('/bilan',                 requireAuth, requireComptable, ctrl.bilan);
router.get('/resultat',              requireAuth, requireComptable, ctrl.resultat);

// B7: Saisie d'écritures manuelles réservée aux comptables+
router.post('/journal',              requireAuth, requireComptable, ctrl.createEcriture);

// B7: Modifications du plan comptable et suppression d'écritures réservées aux admins
router.post('/plan-comptable',       requireAuth, requireAdmin, validate(createCompteComptableSchema), ctrl.createCompte);
router.put('/plan-comptable/:id',    requireAuth, requireAdmin, validate(updateCompteComptableSchema), ctrl.updateCompte);
router.delete('/plan-comptable/:id', requireAuth, requireAdmin, ctrl.deleteCompte);
router.delete('/journal/:id',        requireAuth, requireAdmin, ctrl.deleteEcriture);

// Réconciliation des écritures en échec — visible aux comptables, résolution aux superviseurs+
router.get('/echecs',        requireAuth, requireComptable, ctrl.listEchecs);
router.patch('/echecs/:id',  requireAuth, requireRole('SUPER_ADMIN', 'DIRECTEUR', 'SUPERVISEUR'), ctrl.resoudreEchec);

// Clôture comptable mensuelle — clôture réservée aux admins, réouverture réservée au SUPER_ADMIN seul
router.get('/cloture/periodes',  requireAuth, requireComptable, clotureCtrl.listPeriodes);
router.post('/cloture',          requireAuth, requireAdmin, validate(cloturerPeriodeSchema), clotureCtrl.cloturer);
router.post('/cloture/reouvrir', requireAuth, requireRole('SUPER_ADMIN'), validate(rouvrirPeriodeSchema), clotureCtrl.rouvrir);

export default router;
