import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { requireRole } from '../middleware/rbac';
import { requireCaisseOuverte } from '../middleware/caisse';
import { z } from 'zod';
import { listTaux, setTaux, getTauxActif, effectuerVirementCross } from '../services/tauxChange.service';
import { ok } from '../types';

const router = Router();

router.get('/', requireAuth, async (_req: any, res: any, next: any) => {
  try { res.json(ok(await listTaux())); } catch (e) { next(e); }
});

router.get('/:devise', requireAuth, async (req: any, res: any, next: any) => {
  try { res.json(ok(await getTauxActif(req.params.devise))); } catch (e) { next(e); }
});

const setTauxSchema = z.object({
  devise: z.string().min(3).max(3).toUpperCase(),
  tauxAchat: z.number().positive(),
  tauxVente: z.number().positive(),
}).refine((d) => d.tauxVente >= d.tauxAchat, { message: 'Le taux de vente doit être >= au taux d\'achat', path: ['tauxVente'] });

router.post('/', requireAuth, requireRole('SUPER_ADMIN', 'DIRECTEUR', 'SUPERVISEUR'), async (req: any, res: any, next: any) => {
  try {
    const body = setTauxSchema.parse(req.body);
    const taux = await setTaux({ ...body, userId: req.user!.userId });
    res.json(ok(taux, 'Taux de change mis à jour'));
  } catch (e) { next(e); }
});

const virementChangeSchema = z.object({
  compteSourceId: z.string().cuid(),
  compteDestinationId: z.string().cuid(),
  montant: z.number().positive(),
  sessionId: z.string().optional(),
});

router.post('/virement', requireAuth, requireRole('SUPER_ADMIN', 'DIRECTEUR', 'SUPERVISEUR', 'CAISSIER'), requireCaisseOuverte, async (req: any, res: any, next: any) => {
  try {
    const body = virementChangeSchema.parse(req.body);
    const result = await effectuerVirementCross({ ...body, userId: req.user!.userId, agenceId: req.user!.agenceId });
    res.json(ok(result, 'Virement change effectué'));
  } catch (e) { next(e); }
});

export default router;
