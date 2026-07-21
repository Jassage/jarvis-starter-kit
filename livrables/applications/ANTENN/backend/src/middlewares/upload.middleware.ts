import multer from 'multer';
import path from 'path';
import crypto from 'crypto';
import fs from 'fs';
import { AppError } from './errorHandler.middleware';

// Stockage local sur disque (pas de compte cloud requis dans cet environnement) —
// servi statiquement via /uploads (voir app.ts). urlFichier des Contenus reste un
// champ texte libre pointant vers le futur CDN HLS (Bunny Stream / Cloudflare Stream).
const sponsorsDir = path.join(__dirname, '../../uploads/sponsors');
fs.mkdirSync(sponsorsDir, { recursive: true });

const chaineDir = path.join(__dirname, '../../uploads/chaine');
fs.mkdirSync(chaineDir, { recursive: true });

const replayDir = path.join(__dirname, '../../uploads/replay');
fs.mkdirSync(replayDir, { recursive: true });

function diskStorageIn(dir: string) {
  return multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, dir),
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname);
      cb(null, `${crypto.randomUUID()}${ext}`);
    },
  });
}

const storage = diskStorageIn(sponsorsDir);

function imageFilter(_req: unknown, file: Express.Multer.File, cb: multer.FileFilterCallback) {
  // SVG volontairement exclu : un SVG peut embarquer du JavaScript inline et le
  // dossier /uploads est servi statiquement sans authentification — vecteur de XSS
  // stocké. Les logos rasterisés (PNG/WebP/JPEG) couvrent le besoin sponsor.
  const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    // AppError (extends Error) : remonte en 400 via errorHandler plutôt qu'en 500
    // générique — un format refusé est une erreur du client, pas du serveur.
    cb(new AppError('Format image non supporté. Utilisez JPEG, PNG ou WebP.', 400));
  }
}

export const uploadLogo = multer({
  storage,
  fileFilter: imageFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});

// Logo d'identité de la chaîne (stockage séparé de celui des sponsors).
export const uploadLogoChaine = multer({
  storage: diskStorageIn(chaineDir),
  fileFilter: imageFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});

// Vignette de replay (image d'illustration du catalogue VOD). Même filtre image que
// les logos — la vidéo elle-même n'est jamais uploadée ici, seule son URL est stockée.
export const uploadVignette = multer({
  storage: diskStorageIn(replayDir),
  fileFilter: imageFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});
