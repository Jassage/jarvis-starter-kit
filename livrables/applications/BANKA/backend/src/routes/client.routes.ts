import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { requireRole } from '../middleware/rbac';
import { validate } from '../middleware/validate';
import { uploadDocument } from '../middleware/upload.middleware';
import { createClientSchema, updateClientSchema, changeStatutClientSchema } from '../validation/client.schemas';
import * as ctrl from '../controllers/client.controller';
import * as documentCtrl from '../controllers/document.controller';

const router = Router();

// Documents KYC — montées AVANT les routes génériques /:id pour que "documents" ne soit jamais
// capturé comme un id client par erreur (Express matche dans l'ordre de déclaration)
router.delete('/documents/:id', requireAuth, requireRole('SUPER_ADMIN', 'DIRECTEUR', 'SUPERVISEUR'), documentCtrl.remove);
router.get('/:clientId/documents', requireAuth, documentCtrl.list);
router.post('/:clientId/documents', requireAuth, uploadDocument.single('fichier'), documentCtrl.create);

router.get('/search', requireAuth, ctrl.search);
router.get('/', requireAuth, ctrl.list);
router.get('/:id', requireAuth, ctrl.getOne);
router.post('/', requireAuth, validate(createClientSchema), ctrl.create);
router.put('/:id', requireAuth, validate(updateClientSchema), ctrl.update);
router.patch('/:id/statut', requireAuth, validate(changeStatutClientSchema), ctrl.changeStatut);
// Suppression logique — réservée aux superviseurs+ pour éviter les erreurs caissier
router.delete('/:id', requireAuth, requireRole('SUPER_ADMIN', 'DIRECTEUR', 'SUPERVISEUR'), ctrl.deleteOne);

export default router;
