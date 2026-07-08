import multer from 'multer';
import path from 'path';
import crypto from 'crypto';
import fs from 'fs';

// Stockage local sur disque (pas de compte cloud requis dans cet environnement) —
// servi statiquement via /uploads (voir app.ts). urlFichier des Contenus reste un
// champ texte libre pointant vers le futur CDN HLS (Bunny Stream / Cloudflare Stream).
const sponsorsDir = path.join(__dirname, '../../uploads/sponsors');
fs.mkdirSync(sponsorsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, sponsorsDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${crypto.randomUUID()}${ext}`);
  },
});

function imageFilter(_req: unknown, file: Express.Multer.File, cb: multer.FileFilterCallback) {
  const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/svg+xml'];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Format image non supporté. Utilisez JPEG, PNG, WebP ou SVG.'));
  }
}

export const uploadLogo = multer({
  storage,
  fileFilter: imageFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});
