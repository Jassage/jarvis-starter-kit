import { Request, Response } from 'express';
import path from 'path';
import * as service from './config.service';
import { sendSuccess } from '../../utils/response';
import { AppError } from '../../middlewares/errorHandler.middleware';
import { logAudit } from '../audit/audit.service';
import { env } from '../../config/env';

export async function getConfig(_req: Request, res: Response) {
  const config = await service.getConfig();
  sendSuccess(res, { config });
}

export async function updateConfig(req: Request, res: Response) {
  const config = await service.updateConfig(req.body);
  await logAudit(req, 'CONFIG_CHAINE_MODIFIEE', {
    cible: 'ConfigChaine',
    cibleId: config.id,
    details: `Identité d'antenne mise à jour (${Object.keys(req.body).join(', ')})`,
  });
  sendSuccess(res, { config }, 'Configuration mise à jour');
}

export async function uploadLogo(req: Request, res: Response) {
  if (!req.file) throw new AppError('Fichier logo requis', 400);
  // URL absolue stockée en base (même convention que les logos sponsors) — servie
  // via /uploads statique, chargeable directement par le player sur une autre origine.
  const logoUrl = `${env.PUBLIC_BACKEND_URL}/uploads/chaine/${path.basename(req.file.path)}`;
  const config = await service.updateLogoChaine(logoUrl);
  await logAudit(req, 'CONFIG_CHAINE_MODIFIEE', {
    cible: 'ConfigChaine',
    cibleId: config.id,
    details: 'Logo de chaîne remplacé',
  });
  sendSuccess(res, { config }, 'Logo de chaîne mis à jour');
}
