import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { requireAdmin, requireSupervisor } from '../middleware/rbac';
import * as ctrl from '../controllers/rh.controller';

const router = Router();

// B7: Postes — lecture pour tous les authentifiés, écriture réservée aux admins
router.get('/postes',              requireAuth, ctrl.listPostes);
router.post('/postes',             requireAuth, requireAdmin, ctrl.createPoste);
router.put('/postes/:id',          requireAuth, requireAdmin, ctrl.updatePoste);
router.delete('/postes/:id',       requireAuth, requireAdmin, ctrl.deletePoste);

// B7: Employés — lecture pour superviseurs+, écriture réservée aux admins
router.get('/employes',                      requireAuth, requireSupervisor, ctrl.listEmployes);
router.post('/employes',                     requireAuth, requireAdmin, ctrl.createEmploye);
router.put('/employes/:id',                  requireAuth, requireAdmin, ctrl.updateEmploye);
router.patch('/employes/:id/agence',         requireAuth, requireAdmin, ctrl.transfererEmploye);
router.post('/employes/:id/compte-systeme',  requireAuth, requireAdmin, ctrl.creerCompteSysteme);
router.delete('/employes/:id/compte-systeme',requireAuth, requireAdmin, ctrl.delierCompteSysteme);

// B7: Contrats — lecture pour superviseurs+, gestion par superviseurs+
router.get('/contrats',            requireAuth, requireSupervisor, ctrl.listContrats);
router.post('/contrats',           requireAuth, requireSupervisor, ctrl.createContrat);
router.patch('/contrats/:id/resilier', requireAuth, requireSupervisor, ctrl.resilierContrat);

// B7: Congés — lecture pour superviseurs+, approbation/refus par superviseurs+
router.get('/conges',              requireAuth, requireSupervisor, ctrl.listConges);
router.post('/conges',             requireAuth, requireSupervisor, ctrl.createConge);
router.patch('/conges/:id/statut', requireAuth, requireSupervisor, ctrl.updateStatutConge);

// B7: Paie — opérations financières réservées aux admins uniquement
router.get('/paie',               requireAuth, requireSupervisor, ctrl.listFichesPaie);
router.post('/paie/generer',      requireAuth, requireAdmin, ctrl.genererFichesPaie);
router.patch('/paie/:id/valider',   requireAuth, requireAdmin, ctrl.validerFiche);
router.patch('/paie/:id/invalider', requireAuth, requireAdmin, ctrl.invaliderFiche);
router.post('/paie/payer',          requireAuth, requireAdmin, ctrl.payerSalaires);

// B7: Avances — gestion par superviseurs+
router.get('/avances',            requireAuth, requireSupervisor, ctrl.listAvances);
router.post('/avances',           requireAuth, requireSupervisor, ctrl.creerAvance);
router.patch('/avances/:id/annuler', requireAuth, requireSupervisor, ctrl.annulerAvance);

// B7: Éléments variables — gestion par superviseurs+
router.get('/elements-variables',        requireAuth, requireSupervisor, ctrl.listElementsVariables);
router.post('/elements-variables',       requireAuth, requireSupervisor, ctrl.createElementVariable);
router.delete('/elements-variables/:id', requireAuth, requireSupervisor, ctrl.deleteElementVariable);

export default router;
