import { Response } from 'express';
import * as boutiquesService from './boutiques.service';
import { sendSuccess } from '../../utils/response';
import { AuthRequest, AppError } from '../../types';
import { logAudit } from '../../utils/audit';
import { uploadToCloudinary } from '../../config/cloudinary';

export async function getMine(req: AuthRequest, res: Response) {
  const boutique = await boutiquesService.getMyBoutique(req.boutiqueId!);
  sendSuccess(res, { boutique });
}

export async function updateMine(req: AuthRequest, res: Response) {
  const boutique = await boutiquesService.updateMyBoutique(req.boutiqueId!, req.body);
  await logAudit({ req, action: 'BOUTIQUE_MISE_A_JOUR', entite: 'Boutique', entiteId: boutique.id, changes: req.body });
  sendSuccess(res, { boutique }, 'Boutique mise à jour');
}

export async function uploadLogo(req: AuthRequest, res: Response) {
  if (!req.file) throw new AppError('Aucun fichier fourni', 400);
  const uploaded = await uploadToCloudinary(req.file.buffer, `boutiques/${req.boutiqueId}/logo`, {
    transformation: [{ width: 512, height: 512, crop: 'limit' }],
  });
  const boutique = await boutiquesService.updateMyBoutique(req.boutiqueId!, {
    logoUrl: uploaded.url,
    logoPublicId: uploaded.publicId,
  });
  sendSuccess(res, { boutique }, 'Logo mis à jour');
}

export async function checkSlugAvailability(req: AuthRequest, res: Response) {
  const slug = String(req.query.slug || '');
  const available = await boutiquesService.isSlugAvailable(slug);
  sendSuccess(res, { available });
}
