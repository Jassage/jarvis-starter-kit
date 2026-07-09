import { Router, Response } from "express";
import { requireAuth } from "../middlewares/auth.middleware";
import { AuthRequest } from "../types";
import { prisma } from "../lib/prisma";

const router = Router();

router.get("/", requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const limit = Number(req.query.limit) || 15;
    const notifs = await prisma.notification.findMany({
      where: { userId: req.userId! },
      orderBy: { createdAt: "desc" },
      take: limit,
    });
    res.json({ success: true, data: notifs });
  } catch {
    res.status(500).json({ success: false, error: "Erreur serveur" });
  }
});

router.patch("/read-all", requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    await prisma.notification.updateMany({
      where: { userId: req.userId!, isRead: false },
      data: { isRead: true },
    });
    res.json({ success: true });
  } catch {
    res.status(500).json({ success: false, error: "Erreur serveur" });
  }
});

// Enregistre/écrase le token push Expo de l'appareil courant. Un seul token
// par utilisateur (pas de multi-device) — cohérent avec le reste du projet
// qui ne gère qu'une session active à la fois.
router.put("/push-token", requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { token } = req.body;
    if (!token || typeof token !== "string") {
      res.status(400).json({ success: false, error: "Token requis" });
      return;
    }
    await prisma.user.update({ where: { id: req.userId! }, data: { pushToken: token } });
    res.json({ success: true });
  } catch {
    res.status(500).json({ success: false, error: "Erreur serveur" });
  }
});

export default router;
