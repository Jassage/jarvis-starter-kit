import multer from 'multer';
import path from 'path';
import crypto from 'crypto';

// Stockage local (./uploads/chat côté hôte, hors de backend/src pour ne pas
// être surveillé par tsx watch) — même principe que ./recordings pour Egress,
// pas de stockage objet externe requis.
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, path.resolve(process.cwd(), '../uploads/chat'));
  },
  filename: (_req, file, cb) => {
    const nomUnique = `${Date.now()}-${crypto.randomBytes(8).toString('hex')}${path.extname(file.originalname)}`;
    cb(null, nomUnique);
  },
});

const TYPES_AUTORISES = /^(image\/(jpeg|png|gif|webp)|audio\/(webm|mpeg|mp4|ogg|wav))$/;

export const uploadChat = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 Mo — même limite que le reste du portefeuille
  fileFilter: (_req, file, cb) => {
    if (TYPES_AUTORISES.test(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Type de fichier non autorisé (image ou audio uniquement)'));
    }
  },
});
