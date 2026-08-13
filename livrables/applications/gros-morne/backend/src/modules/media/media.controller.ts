import { Response } from 'express';
import prisma from '../../config/database';
import { sendSuccess } from '../../utils/response';
import { AuthRequest, AppError } from '../../types';
import { MediaType } from '@prisma/client';

function typeFromMime(mimeType: string): MediaType {
  if (mimeType.startsWith('image/')) return 'IMAGE';
  return 'DOCUMENT';
}

export async function upload(req: AuthRequest, res: Response) {
  if (!req.file) throw new AppError(400, 'Aucun fichier reçu');

  const media = await prisma.media.create({
    data: {
      type: typeFromMime(req.file.mimetype),
      url: `/uploads/${req.file.filename}`,
      nomOriginal: req.file.originalname,
      mimeType: req.file.mimetype,
      tailleOctets: req.file.size,
      uploadedById: req.user!.userId,
    },
  });

  sendSuccess(res, { media }, 'Fichier téléversé', 201);
}

export async function list(req: AuthRequest, res: Response) {
  const medias = await prisma.media.findMany({ orderBy: { createdAt: 'desc' } });
  sendSuccess(res, { medias });
}
