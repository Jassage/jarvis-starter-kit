import { Response } from 'express';
import * as notificationsService from './notifications.service';
import { sendSuccess } from '../../utils/response';
import { AuthRequest } from '../../types';

export async function list(req: AuthRequest, res: Response) {
  const notifications = await notificationsService.listNotifications(req.boutiqueId!);
  sendSuccess(res, { notifications });
}

export async function markAsRead(req: AuthRequest, res: Response) {
  await notificationsService.markAsRead(req.boutiqueId!, req.params.id);
  sendSuccess(res, null, 'Notification marquée comme lue');
}
