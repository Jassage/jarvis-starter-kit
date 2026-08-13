import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { AppError } from '../types';

// Stockage disque local, hors de src/ (même principe que REYINYON/gros-morne — pas de service
// tiers pour un besoin aussi simple qu'une pièce jointe d'ordonnance).
const UPLOAD_DIR = path.join(__dirname, '..', '..', 'uploads', 'ordonnances');
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const ALLOWED_MIME = new Set(['image/jpeg', 'image/png', 'image/webp', 'application/pdf']);

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
  },
});

export const uploadPieceJointe = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 Mo, même plafond que le reste du portefeuille
  fileFilter: (_req, file, cb) => {
    if (!ALLOWED_MIME.has(file.mimetype)) {
      return cb(new AppError(400, 'Format de fichier non autorisé (image ou PDF uniquement)') as unknown as Error);
    }
    cb(null, true);
  },
}).single('fichier');
