import { Response } from 'express';
import * as categoriesService from './categories.service';
import { sendSuccess } from '../../utils/response';
import { AuthRequest } from '../../types';
import { logAudit } from '../../utils/audit';

export async function list(req: AuthRequest, res: Response) {
  const categories = await categoriesService.listCategories(req.boutiqueId!);
  sendSuccess(res, { categories });
}

export async function create(req: AuthRequest, res: Response) {
  const category = await categoriesService.createCategory(req.boutiqueId!, req.body.name);
  await logAudit({ req, action: 'CATEGORIE_CREEE', entite: 'Category', entiteId: category.id });
  sendSuccess(res, { category }, 'Catégorie créée', 201);
}

export async function update(req: AuthRequest, res: Response) {
  const category = await categoriesService.updateCategory(req.boutiqueId!, req.params.id, req.body.name);
  await logAudit({ req, action: 'CATEGORIE_MISE_A_JOUR', entite: 'Category', entiteId: category.id });
  sendSuccess(res, { category }, 'Catégorie mise à jour');
}

export async function remove(req: AuthRequest, res: Response) {
  await categoriesService.deleteCategory(req.boutiqueId!, req.params.id);
  await logAudit({ req, action: 'CATEGORIE_SUPPRIMEE', entite: 'Category', entiteId: req.params.id });
  sendSuccess(res, null, 'Catégorie supprimée');
}
