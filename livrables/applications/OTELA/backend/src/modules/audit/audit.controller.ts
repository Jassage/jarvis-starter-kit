import { Request, Response } from 'express';
import * as service from './audit.service';
import { sendSuccess } from '../../utils/response';

export async function list(req: Request, res: Response) {
  const { action, employeId, from, to, limit, offset } = req.query as unknown as {
    action?: string;
    employeId?: string;
    from?: Date;
    to?: Date;
    limit: number;
    offset: number;
  };

  // req.etablissementId vient de resolveEtablissement : null pour un administrateur
  // de chaîne (vue consolidée), l'établissement du compte sinon. Jamais un paramètre
  // client, sans quoi n'importe qui lirait le journal d'un autre établissement.
  const { entrees, total } = await service.listerJournal({
    action,
    employeId,
    etablissementId: req.etablissementId ?? null,
    from,
    to,
    limit,
    offset,
  });

  sendSuccess(res, { entrees }, 'Journal d\'audit', 200, { total, limit, offset });
}

export async function actions(_req: Request, res: Response) {
  const actions = await service.listerActions();
  sendSuccess(res, { actions });
}
