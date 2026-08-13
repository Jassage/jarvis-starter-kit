import { Response } from 'express';
import * as dashboardService from './dashboard.service';
import { sendSuccess } from '../../utils/response';
import { AuthRequest } from '../../types';
import { asyncHandler } from '../../utils/asyncHandler';

export const getStats = asyncHandler(async (req: AuthRequest, res: Response) => {
  sendSuccess(res, await dashboardService.getStats(req.user!.pharmacieId));
});

export const getStatsPeriode = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { preset, debut, fin } = req.query as { preset: string; debut?: string; fin?: string };
  sendSuccess(res, await dashboardService.getStatsPeriode(req.user!.pharmacieId, preset as never, debut, fin));
});
