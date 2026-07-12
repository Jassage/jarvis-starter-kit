import multer from 'multer';
import path from 'path';
import crypto from 'crypto';
import fs from 'fs';
import { AppError } from '../types';

// Stockage local sur disque (pas de compte cloud requis dans cet environnement) — servi
// statiquement via /uploads (voir app.ts). Même pattern que ANTENN (uploads/sponsors).
const documentsDir = path.join(__dirname, '../../uploads/documents');
fs.mkdirSync(documentsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, documentsDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${crypto.randomUUID()}${ext}`);
  },
});

function documentFilter(_req: unknown, file: Express.Multer.File, cb: multer.FileFilterCallback) {
  const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf'];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    // AppError plutôt qu'une Error générique : le errorHandler global le reconnaît et renvoie un
    // 400 avec ce message précis, au lieu du 500 "Erreur serveur interne" qu'une Error simple produit
    cb(new AppError(400, 'Format non supporté. Utilisez JPEG, PNG, WebP ou PDF.'));
  }
}

export const uploadDocument = multer({
  storage,
  fileFilter: documentFilter,
  limits: { fileSize: 10 * 1024 * 1024 },
});
