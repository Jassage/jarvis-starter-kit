import { Response } from 'express';
import * as notificationService from './notification.service';
import { sendSuccess } from '../../utils/response';
import { AuthRequest } from '../../types';
import { asyncHandler } from '../../utils/asyncHandler';

export const list = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { limit, lue } = req.query as unknown as { limit: unknown; lue?: boolean };
  sendSuccess(res, await notificationService.list(req.user!.pharmacieId, { limit: Number(limit), lue }));
});

export const compterNonLues = asyncHandler(async (req: AuthRequest, res: Response) => {
  sendSuccess(res, { nonLues: await notificationService.compterNonLues(req.user!.pharmacieId) });
});

export const marquerLue = asyncHandler(async (req: AuthRequest, res: Response) => {
  sendSuccess(res, await notificationService.marquerLue(req.user!.pharmacieId, req.params.id), 'Notification marquée comme lue');
});

export const toutMarquerLu = asyncHandler(async (req: AuthRequest, res: Response) => {
  await notificationService.toutMarquerLu(req.user!.pharmacieId);
  sendSuccess(res, null, 'Toutes les notifications ont été marquées comme lues');
});
