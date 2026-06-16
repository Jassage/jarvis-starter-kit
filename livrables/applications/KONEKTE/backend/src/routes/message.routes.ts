import { Router, Response } from "express";
import multer from "multer";
import path from "path";
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import { requireAuth } from "../middlewares/auth.middleware";
import { AuthRequest } from "../types";
import { getConversationMessages, sendMessageService } from "../services/message.service";
import { prisma } from "../lib/prisma";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const mediaStorage = multer.diskStorage({
  destination: "uploads/",
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname) || (file.mimetype === "audio/webm" ? ".webm" : ".bin");
    cb(null, `msg_${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`);
  },
});

const uploadMedia = multer({
  storage: mediaStorage,
  limits: { fileSize: 15 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = ["image/jpeg", "image/png", "image/webp", "audio/webm", "audio/ogg", "audio/mp4", "audio/mpeg"];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error("Format non supporté"));
  },
});

const router = Router();

router.get("/unread-count", requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const count = await prisma.message.count({
      where: { receiverId: req.userId!, status: { not: "READ" } },
    });
    res.json({ success: true, data: { count } });
  } catch {
    res.status(500).json({ success: false, error: "Erreur serveur" });
  }
});

router.get("/:conversationId", requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const result = await getConversationMessages(
      req.params.conversationId as string,
      req.userId!,
      Number(req.query.page) || 1,
      Number(req.query.limit) || 30
    );
    res.json({ success: true, data: result.messages, otherUser: result.otherUser, matchId: result.matchId });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erreur serveur";
    res.status(400).json({ success: false, error: message });
  }
});

router.post("/:conversationId/media", requireAuth, uploadMedia.single("file"), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.file) { res.status(400).json({ success: false, error: "Fichier manquant" }); return; }

    const isImage = req.file.mimetype.startsWith("image/");
    const msgType = isImage ? "IMAGE" : "VOICE";

    let mediaUrl: string;
    if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_CLOUD_NAME !== "ton_cloud_name") {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "konekte/messages",
        resource_type: isImage ? "image" : "video",
        ...(isImage ? { transformation: [{ width: 800, crop: "limit" }] } : {}),
      });
      mediaUrl = result.secure_url;
      fs.unlinkSync(req.file.path);
    } else {
      mediaUrl = `/uploads/${path.basename(req.file.path)}`;
    }

    const conversation = await prisma.conversation.findUnique({
      where: { id: req.params.conversationId as string },
      include: { match: true },
    });
    if (!conversation) { res.status(404).json({ success: false, error: "Conversation introuvable" }); return; }

    const { userAId, userBId } = conversation.match;
    if (req.userId !== userAId && req.userId !== userBId) { res.status(403).json({ success: false, error: "Accès refusé" }); return; }

    const receiverId = req.userId === userAId ? userBId : userAId;
    const message = await prisma.message.create({
      data: {
        conversationId: req.params.conversationId as string,
        senderId: req.userId!,
        receiverId,
        type: msgType as "IMAGE" | "VOICE",
        content: isImage ? "📷 Photo" : "🎤 Message vocal",
        mediaUrl,
      },
    });

    await prisma.conversation.update({ where: { id: req.params.conversationId as string }, data: { updatedAt: new Date() } });

    res.status(201).json({ success: true, data: message });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erreur serveur";
    res.status(400).json({ success: false, error: message });
  }
});

router.post("/:conversationId", requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { content } = req.body;
    if (!content?.trim()) {
      res.status(400).json({ success: false, error: "Message vide" });
      return;
    }
    const message = await sendMessageService(
      req.params.conversationId as string,
      req.userId!,
      content
    );
    res.status(201).json({ success: true, data: message });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erreur serveur";
    res.status(400).json({ success: false, error: message });
  }
});

export default router;
