import { Response, NextFunction } from 'express';
import { AuthRequest, ok } from '../types';
import * as clientService from '../services/client.service';

export async function list(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { search, statut, type, page, limit } = req.query as Record<string, string>;
    const result = await clientService.listClients({
      search, statut: statut as any, type: type as any,
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 20,
    });
    res.json(ok(result));
  } catch (e) { next(e); }
}

export async function getOne(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const client = await clientService.getClient(req.params.id);
    res.json(ok(client));
  } catch (e) { next(e); }
}

export async function create(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const client = await clientService.createClient(req.body, req.user!.userId);
    res.status(201).json(ok(client, 'Client créé avec succès'));
  } catch (e) { next(e); }
}

export async function update(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const client = await clientService.updateClient(req.params.id, req.body, req.user!.userId);
    res.json(ok(client));
  } catch (e) { next(e); }
}

export async function changeStatut(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const client = await clientService.changeStatutClient(req.params.id, req.body.statut, req.user!.userId);
    res.json(ok(client));
  } catch (e) { next(e); }
}

export async function search(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { q } = req.query as { q: string };
    const clients = await clientService.searchClients(q || '');
    res.json(ok(clients));
  } catch (e) { next(e); }
}
