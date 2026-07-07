import { Response } from 'express';
import * as aliasService from './alias.service';
import { sendSuccess } from '../../utils/response';
import { AuthRequest } from '../../types';
import { logAudit } from '../../utils/audit';

export async function createAlias(req: AuthRequest, res: Response) {
  const alias = await aliasService.createAlias(
    req.params.domainId,
    req.user!,
    req.body.source,
    req.body.destination
  );
  await logAudit({
    req,
    action: 'ALIAS_CREE',
    entite: 'Alias',
    entiteId: alias.id,
    changes: { source: alias.source, destination: alias.destination },
  });
  sendSuccess(res, { alias }, 'Alias créé', 201);
}

export async function listAliases(req: AuthRequest, res: Response) {
  const aliases = await aliasService.listAliases(req.params.domainId, req.user!);
  sendSuccess(res, { aliases });
}

export async function getAlias(req: AuthRequest, res: Response) {
  const alias = await aliasService.getAlias(req.params.domainId, req.params.id, req.user!);
  sendSuccess(res, { alias });
}

export async function updateAlias(req: AuthRequest, res: Response) {
  const alias = await aliasService.updateAlias(req.params.domainId, req.params.id, req.user!, {
    destination: req.body.destination,
    actif: req.body.actif,
  });
  await logAudit({
    req,
    action: 'ALIAS_MODIFIE',
    entite: 'Alias',
    entiteId: alias.id,
    changes: { source: alias.source, destination: alias.destination, actif: alias.actif },
  });
  sendSuccess(res, { alias }, 'Alias mis à jour');
}

export async function deleteAlias(req: AuthRequest, res: Response) {
  const alias = await aliasService.getAlias(req.params.domainId, req.params.id, req.user!);
  await aliasService.deleteAlias(req.params.domainId, req.params.id, req.user!);
  await logAudit({
    req,
    action: 'ALIAS_SUPPRIME',
    entite: 'Alias',
    entiteId: alias.id,
    changes: { source: alias.source },
  });
  sendSuccess(res, null, 'Alias supprimé');
}
