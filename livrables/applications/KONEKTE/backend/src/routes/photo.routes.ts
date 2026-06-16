import { Router, Response } from "express";
import multer from "multer";
import path from "path";
import { requireAuth } from "../middlewares/auth.middleware";
import { AuthRequest } from "../types";
import { uploadPhotoService, deletePhotoService, setMainPhotoService } from "../services/photo.service";

const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = ["image/jpeg", "image/png", "image/webp"];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error("Format non supporté. Utilisez JPEG, PNG ou WEBP."));
  },
});

const router = Router();

router.post("/", requireAuth, upload.single("photo"), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ success: false, error: "Aucun fichier reçu" });
      return;
    }
    const isMain = req.body.isMain === "true";
    const photo = await uploadPhotoService(req.userId!, req.file.path, isMain);
    res.status(201).json({ success: true, data: photo });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erreur serveur";
    res.status(400).json({ success: false, error: message });
  }
});

router.delete("/:photoId", requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    await deletePhotoService(req.userId!, req.params.photoId as string);
    res.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erreur serveur";
    res.status(400).json({ success: false, error: message });
  }
});

router.patch("/:photoId/main", requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    await setMainPhotoService(req.userId!, req.params.photoId as string);
    res.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erreur serveur";
    res.status(400).json({ success: false, error: message });
  }
});

export default router;
