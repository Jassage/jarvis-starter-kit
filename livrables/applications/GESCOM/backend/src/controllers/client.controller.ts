import { Response, NextFunction } from 'express';
import { AuthRequest, ok } from '../types';
import * as clientService from '../services/client.service';

export async function list(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { search, type, actif } = req.query;
    const clients = await clientService.listClients({
      search: search as string | undefined,
      type: type as string | undefined,
      actif: actif === undefined ? undefined : actif === 'true',
    });
    res.json(ok(clients));
  } catch (e) { next(e); }
}

export async function create(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const client = await clientService.createClient(req.body, req.user!.userId);
    res.status(201).json(ok(client, 'Client créé'));
  } catch (e) { next(e); }
}

export async function update(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const client = await clientService.updateClient(req.params.id, req.body, req.user!.userId);
    res.json(ok(client, 'Client mis à jour'));
  } catch (e) { next(e); }
}

export async function archive(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    await clientService.archiveClient(req.params.id, req.user!.userId);
    res.json(ok(null, 'Client archivé'));
  } catch (e) { next(e); }
}
