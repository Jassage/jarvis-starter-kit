import { Response, NextFunction } from 'express';
import { AuthRequest, ok } from '../types';
import * as dashboardService from '../services/dashboard.service';

export async function getStats(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const stats = await dashboardService.getDashboardStats();
    res.json(ok(stats));
  } catch (e) { next(e); }
}
