import { Response } from 'express';
import * as domainService from './domain.service';
import { sendSuccess } from '../../utils/response';
import { AuthRequest } from '../../types';
import { logAudit } from '../../utils/audit';

export async function createDomain(req: AuthRequest, res: Response) {
  const domain = await domainService.createDomain(req.user!.userId, req.body.nomDomaine);
  await logAudit({
    req,
    action: 'DOMAINE_CREE',
    entite: 'Domain',
    entiteId: domain.id,
    changes: { nomDomaine: domain.nomDomaine },
  });
  sendSuccess(res, { domain }, 'Domaine créé, configurez les enregistrements DNS', 201);
}

export async function listDomains(req: AuthRequest, res: Response) {
  const domains = await domainService.listDomains(req.user!);
  sendSuccess(res, { domains });
}

export async function getDomain(req: AuthRequest, res: Response) {
  const domain = await domainService.getDomain(req.params.id, req.user!);
  sendSuccess(res, { domain });
}

export async function verifyDomain(req: AuthRequest, res: Response) {
  const domain = await domainService.verifyDomain(req.params.id, req.user!);
  sendSuccess(res, { domain }, 'Vérification DNS effectuée');
}

export async function deleteDomain(req: AuthRequest, res: Response) {
  const domain = await domainService.getDomain(req.params.id, req.user!);
  await domainService.deleteDomain(req.params.id, req.user!);
  await logAudit({
    req,
    action: 'DOMAINE_SUPPRIME',
    entite: 'Domain',
    entiteId: domain.id,
    changes: { nomDomaine: domain.nomDomaine },
  });
  sendSuccess(res, null, 'Domaine supprimé');
}
