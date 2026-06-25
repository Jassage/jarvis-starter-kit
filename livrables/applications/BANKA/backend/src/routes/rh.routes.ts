import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import * as ctrl from '../controllers/rh.controller';

const router = Router();

router.get('/postes',              requireAuth, ctrl.listPostes);
router.post('/postes',             requireAuth, ctrl.createPoste);
router.put('/postes/:id',          requireAuth, ctrl.updatePoste);
router.delete('/postes/:id',       requireAuth, ctrl.deletePoste);

router.get('/employes',            requireAuth, ctrl.listEmployes);
router.post('/employes',           requireAuth, ctrl.createEmploye);
router.put('/employes/:id',        requireAuth, ctrl.updateEmploye);

router.get('/contrats',            requireAuth, ctrl.listContrats);
router.post('/contrats',           requireAuth, ctrl.createContrat);
router.patch('/contrats/:id/resilier', requireAuth, ctrl.resilierContrat);

router.get('/conges',           requireAuth, ctrl.listConges);
router.post('/conges',          requireAuth, ctrl.createConge);
router.patch('/conges/:id/statut', requireAuth, ctrl.updateStatutConge);

router.get('/paie',               requireAuth, ctrl.listFichesPaie);
router.post('/paie/generer',      requireAuth, ctrl.genererFichesPaie);
router.patch('/paie/:id/valider', requireAuth, ctrl.validerFiche);
router.post('/paie/payer',        requireAuth, ctrl.payerSalaires);

router.get('/avances',            requireAuth, ctrl.listAvances);
router.post('/avances',           requireAuth, ctrl.creerAvance);
router.patch('/avances/:id/annuler', requireAuth, ctrl.annulerAvance);

router.get('/elements-variables',      requireAuth, ctrl.listElementsVariables);
router.post('/elements-variables',     requireAuth, ctrl.createElementVariable);
router.delete('/elements-variables/:id', requireAuth, ctrl.deleteElementVariable);

export default router;
