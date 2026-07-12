import { Response, NextFunction } from 'express';
import { AuthRequest, ok, AppError } from '../types';
import * as svc from '../services/document.service';

export async function list(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const documents = await svc.listDocuments(req.params.clientId);
    res.json(ok(documents));
  } catch (e) { next(e); }
}

export async function create(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    if (!req.file) throw new AppError(400, 'Aucun fichier reçu');
    const document = await svc.createDocument(req.params.clientId, req.file, req.body, req.user!.userId);
    res.status(201).json(ok(document, 'Document ajouté'));
  } catch (e) { next(e); }
}

export async function remove(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    await svc.deleteDocument(req.params.id, req.user!.userId);
    res.json(ok(null, 'Document supprimé'));
  } catch (e) { next(e); }
}
