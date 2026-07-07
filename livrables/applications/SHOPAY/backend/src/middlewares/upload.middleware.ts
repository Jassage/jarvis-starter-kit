import multer from 'multer';

const storage = multer.memoryStorage();

function imageFileFilter(_req: unknown, file: Express.Multer.File, cb: multer.FileFilterCallback) {
  if (!file.mimetype.startsWith('image/')) {
    return cb(new Error('Seuls les fichiers image sont acceptés'));
  }
  cb(null, true);
}

export const uploadImage = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: imageFileFilter,
});
