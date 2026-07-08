import { Request, Response } from 'express';
import * as service from './epg.service';
import { sendSuccess } from '../../utils/response';
import { env } from '../../config/env';

export async function getEpg(_req: Request, res: Response) {
  const epg = await service.getEpg();
  sendSuccess(res, { ...epg, cdnBaseUrl: env.CDN_BASE_URL || null });
}
