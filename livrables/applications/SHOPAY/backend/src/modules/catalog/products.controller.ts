import { Response } from 'express';
import * as productsService from './products.service';
import { sendSuccess } from '../../utils/response';
import { AuthRequest, AppError } from '../../types';
import { logAudit } from '../../utils/audit';
import { uploadToCloudinary, deleteFromCloudinary } from '../../config/cloudinary';
import prisma from '../../config/database';

export async function list(req: AuthRequest, res: Response) {
  const products = await productsService.listProducts(req.boutiqueId!, {
    status: req.query.status as string | undefined,
    categoryId: req.query.categoryId as string | undefined,
  });
  sendSuccess(res, { products });
}

export async function getOne(req: AuthRequest, res: Response) {
  const product = await productsService.getProduct(req.boutiqueId!, req.params.id);
  sendSuccess(res, { product });
}

export async function create(req: AuthRequest, res: Response) {
  const product = await productsService.createProduct(req.boutiqueId!, req.body);
  await logAudit({ req, action: 'PRODUIT_CREE', entite: 'Product', entiteId: product.id });
  sendSuccess(res, { product }, 'Produit créé', 201);
}

export async function update(req: AuthRequest, res: Response) {
  const product = await productsService.updateProduct(req.boutiqueId!, req.params.id, req.body);
  await logAudit({ req, action: 'PRODUIT_MIS_A_JOUR', entite: 'Product', entiteId: product.id, changes: req.body });
  sendSuccess(res, { product }, 'Produit mis à jour');
}

export async function remove(req: AuthRequest, res: Response) {
  await productsService.deleteProduct(req.boutiqueId!, req.params.id);
  await logAudit({ req, action: 'PRODUIT_SUPPRIME', entite: 'Product', entiteId: req.params.id });
  sendSuccess(res, null, 'Produit supprimé');
}

export async function uploadImage(req: AuthRequest, res: Response) {
  if (!req.file) throw new AppError('Aucun fichier fourni', 400);
  const uploaded = await uploadToCloudinary(req.file.buffer, `boutiques/${req.boutiqueId}/products/${req.params.id}`, {
    transformation: [{ width: 1200, crop: 'limit', quality: 80 }],
  });
  const image = await productsService.addProductImage(req.boutiqueId!, req.params.id, uploaded.url, uploaded.publicId);
  sendSuccess(res, { image }, 'Image ajoutée', 201);
}

export async function removeImage(req: AuthRequest, res: Response) {
  const image = await prisma.productImage.findUnique({ where: { id: req.params.imageId } });
  await productsService.removeProductImage(req.boutiqueId!, req.params.id, req.params.imageId);
  if (image?.publicId) await deleteFromCloudinary(image.publicId);
  sendSuccess(res, null, 'Image supprimée');
}
