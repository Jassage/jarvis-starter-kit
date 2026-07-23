import { Request, Response } from 'express';
import * as service from './maintenance.service';
import { sendSuccess } from '../../utils/response';
import { AppError } from '../../middlewares/errorHandler.middleware';

export async function listTickets(req: Request, res: Response) {
  if (!req.etablissementId) throw new AppError('etablissementId requis', 400);
  const statut = req.query.statut as never;
  const tickets = await service.listTickets(req.etablissementId, statut);
  sendSuccess(res, { tickets });
}

export async function listEmployesMaintenance(req: Request, res: Response) {
  if (!req.etablissementId) throw new AppError('etablissementId requis', 400);
  const employes = await service.listEmployesMaintenance(req.etablissementId);
  sendSuccess(res, { employes });
}

export async function creerTicket(req: Request, res: Response) {
  if (!req.employe) throw new AppError('Non authentifié', 401);
  const ticket = await service.creerTicket(req.etablissementId, req.employe.id, req.body);
  sendSuccess(res, { ticket }, 'Ticket créé', 201);
}

export async function updateTicket(req: Request, res: Response) {
  const ticket = await service.updateTicket(req.params.id, req.etablissementId, req.body);
  sendSuccess(res, { ticket }, 'Ticket mis à jour');
}
