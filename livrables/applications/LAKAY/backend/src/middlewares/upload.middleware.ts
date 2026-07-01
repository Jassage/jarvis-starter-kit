import multer from 'multer';
import { env } from '../config/env';

const storage = multer.memoryStorage();

const imageFilter: multer.Options['fileFilter'] = (_req, file, cb) => {
  const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Format image non supporté. Utilisez JPEG, PNG ou WebP.'));
  }
};

const videoFilter: multer.Options['fileFilter'] = (_req, file, cb) => {
  const allowed = ['video/mp4', 'video/mpeg', 'video/quicktime', 'video/webm'];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Format vidéo non supporté. Utilisez MP4, MOV ou WebM.'));
  }
};

export const uploadImages = multer({
  storage,
  fileFilter: imageFilter,
  limits: { fileSize: env.MAX_FILE_SIZE_MB * 1024 * 1024, files: env.MAX_IMAGES_PER_LISTING },
});

export const uploadVideo = multer({
  storage,
  fileFilter: videoFilter,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB pour vidéos
});

export const uploadAvatar = multer({
  storage,
  fileFilter: imageFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});
