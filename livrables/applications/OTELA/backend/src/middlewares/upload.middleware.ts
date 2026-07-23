import fs from 'fs';
import path from 'path';
import multer, { FileFilterCallback, MulterError } from 'multer';
import { Request, Response, NextFunction, RequestHandler } from 'express';
import { AppError } from './errorHandler.middleware';
import { env } from '../config/env';

// Stockage sur disque local plutôt que Cloudinary : même choix que BANKA (module
// Documents/KYC), ANTENN (logos de chaîne) et REYINYON (chat). Aucune dépendance à
// un compte externe ni au réseau, ce qui compte pour un déploiement haïtien.
// Toute la couche est concentrée ici pour rester migrable vers un stockage objet
// sans toucher aux services métier.

export const UPLOAD_ROOT = path.resolve(process.cwd(), 'uploads');

export type SousDossierUpload = 'logos' | 'chambres' | 'signatures';

function dossierDe(sousDossier: SousDossierUpload): string {
  const dossier = path.join(UPLOAD_ROOT, sousDossier);
  fs.mkdirSync(dossier, { recursive: true });
  return dossier;
}

// SVG volontairement exclu : un SVG peut embarquer du JavaScript et devient un
// vecteur de XSS stocké dès lors que le fichier est servi depuis notre domaine.
// Faille réellement trouvée et corrigée sur ANTENN, à ne pas réintroduire ici.
const MIMES_AUTORISES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

const EXTENSIONS = new Map([
  ['image/jpeg', '.jpg'],
  ['image/png', '.png'],
  ['image/webp', '.webp'],
  ['image/gif', '.gif'],
]);

export const TAILLE_MAX_OCTETS = 5 * 1024 * 1024;

function imageFilter(_req: Request, file: Express.Multer.File, cb: FileFilterCallback) {
  if (!MIMES_AUTORISES.includes(file.mimetype)) {
    // Refus signalé par une AppError plutôt que par une erreur multer générique,
    // qui remonterait en 500 au lieu du 400 attendu (autre correctif ANTENN).
    return cb(new AppError(`Format non supporté : ${file.mimetype}. Formats acceptés : JPEG, PNG, WebP, GIF.`, 400));
  }
  cb(null, true);
}

function creerUpload(sousDossier: SousDossierUpload) {
  return multer({
    storage: multer.diskStorage({
      destination: (_req, _file, cb) => cb(null, dossierDe(sousDossier)),
      filename: (_req, file, cb) => {
        // Nom généré, jamais le nom d'origine : évite la traversée de chemin et les
        // collisions entre deux envois simultanés du même fichier.
        const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        cb(null, `${unique}${EXTENSIONS.get(file.mimetype) ?? '.bin'}`);
      },
    }),
    fileFilter: imageFilter,
    limits: { fileSize: TAILLE_MAX_OCTETS },
  });
}

const uploadLogo = creerUpload('logos');
const uploadPhotosChambre = creerUpload('chambres');
const uploadSignature = creerUpload('signatures');

// Enveloppe les handlers multer pour convertir ses erreurs en AppError : sans cela,
// un dépassement de taille remonte en 500 alors que c'est une erreur d'appelant.
function envelopper(handler: RequestHandler): RequestHandler {
  return (req: Request, res: Response, next: NextFunction) => {
    handler(req, res, (err: unknown) => {
      if (err instanceof MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return next(new AppError(`Fichier trop volumineux (maximum ${TAILLE_MAX_OCTETS / 1024 / 1024} Mo).`, 400));
        }
        if (err.code === 'LIMIT_FILE_COUNT' || err.code === 'LIMIT_UNEXPECTED_FILE') {
          return next(new AppError('Trop de fichiers envoyés en une seule requête.', 400));
        }
        return next(new AppError(`Envoi refusé : ${err.message}`, 400));
      }
      if (err) return next(err);
      next();
    });
  };
}

export const uploadLogoEtablissement = envelopper(uploadLogo.single('logo'));
export const uploadPhotosTypeChambre = envelopper(uploadPhotosChambre.array('photos', 10));
export const uploadSignatureCheckIn = envelopper(uploadSignature.single('signature'));

// URL absolue : le frontend et le futur site vitrine tournent sur une autre origine
// que l'API, un chemin relatif ne serait pas résolvable côté client.
export function urlPublique(sousDossier: SousDossierUpload, nomFichier: string): string {
  return `${env.PUBLIC_BACKEND_URL.replace(/\/$/, '')}/uploads/${sousDossier}/${nomFichier}`;
}

// Supprime le fichier correspondant à une URL publique produite par urlPublique().
// Silencieux si le fichier a déjà disparu : la suppression en base ne doit jamais
// échouer parce que le disque a été nettoyé à la main.
export function supprimerFichierDepuisUrl(url: string | null | undefined): void {
  if (!url) return;
  const marqueur = '/uploads/';
  const index = url.indexOf(marqueur);
  if (index === -1) return;

  const relatif = url.slice(index + marqueur.length);
  const cible = path.resolve(UPLOAD_ROOT, relatif);

  // Garde anti-traversée : ne jamais supprimer hors du dossier uploads, même si
  // l'URL stockée en base a été forgée.
  if (!cible.startsWith(UPLOAD_ROOT + path.sep)) return;

  try {
    fs.unlinkSync(cible);
  } catch {
    /* fichier déjà absent — rien à faire */
  }
}
