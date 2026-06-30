import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { requireAdmin, requireComptable, requireRole } from '../middleware/rbac';
import * as ctrl from '../controllers/compta.controller';

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
router.post('/plan-comptable',       requireAuth, requireAdmin, ctrl.createCompte);
router.put('/plan-comptable/:id',    requireAuth, requireAdmin, ctrl.updateCompte);
router.delete('/plan-comptable/:id', requireAuth, requireAdmin, ctrl.deleteCompte);
router.delete('/journal/:id',        requireAuth, requireAdmin, ctrl.deleteEcriture);

// Réconciliation des écritures en échec — visible aux comptables, résolution aux superviseurs+
router.get('/echecs',        requireAuth, requireComptable, ctrl.listEchecs);
router.patch('/echecs/:id',  requireAuth, requireRole('SUPER_ADMIN', 'DIRECTEUR', 'SUPERVISEUR'), ctrl.resoudreEchec);

export default router;
