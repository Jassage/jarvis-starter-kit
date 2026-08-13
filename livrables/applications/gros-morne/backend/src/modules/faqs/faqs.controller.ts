import { Response } from 'express';
import { CategorieFaq } from '@prisma/client';
import * as service from './faqs.service';
import { sendSuccess } from '../../utils/response';
import { AuthRequest } from '../../types';

export async function listPublique(req: AuthRequest, res: Response) {
  const categorie = req.query.categorie as CategorieFaq | undefined;
  const faqs = await service.listPublique(categorie);
  sendSuccess(res, { faqs });
}

export async function listAdmin(_req: AuthRequest, res: Response) {
  const faqs = await service.listAdmin();
  sendSuccess(res, { faqs });
}

export async function create(req: AuthRequest, res: Response) {
  const faq = await service.create(req.body);
  sendSuccess(res, { faq }, 'Question créée', 201);
}

export async function update(req: AuthRequest, res: Response) {
  const faq = await service.update(req.params.id, req.body);
  sendSuccess(res, { faq }, 'Question mise à jour');
}

export async function remove(req: AuthRequest, res: Response) {
  await service.remove(req.params.id);
  sendSuccess(res, null, 'Question supprimée');
}
