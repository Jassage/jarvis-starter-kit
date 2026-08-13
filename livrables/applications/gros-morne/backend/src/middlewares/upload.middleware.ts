import multer from 'multer';
import path from 'path';
import crypto from 'crypto';

// Stockage local (./uploads à la racine du projet, hors de backend/src pour ne pas être
// surveillé par le hot-reload ts-node/nodemon) — même principe que REYINYON/POSTA.
const UPLOAD_DIR = path.resolve(process.cwd(), '../uploads');

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (_req, file, cb) => {
    const nomUnique = `${Date.now()}-${crypto.randomBytes(8).toString('hex')}${path.extname(file.originalname)}`;
    cb(null, nomUnique);
  },
});

const TYPES_AUTORISES = /^(image\/(jpeg|png|webp|gif)|application\/pdf)$/;

export const uploadMedia = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 Mo — standard du portefeuille
  fileFilter: (_req, file, cb) => {
    if (TYPES_AUTORISES.test(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Type de fichier non autorisé (image ou PDF uniquement)'));
    }
  },
});

export { UPLOAD_DIR };
