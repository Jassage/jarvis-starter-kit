import { Router, Response } from "express";
import { requireAuth } from "../middlewares/auth.middleware";
import { AuthRequest } from "../types";
import { prisma } from "../lib/prisma";

const router = Router();

router.get("/stats", requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const [totalUsers, totalMatches, totalMessages, pendingReports] = await Promise.all([
      prisma.user.count({ where: { isActive: true, isBanned: false } }),
      prisma.match.count({ where: { isActive: true } }),
      prisma.message.count(),
      prisma.report.count({ where: { isReviewed: false } }),
    ]);
    res.json({ success: true, data: { totalUsers, totalMatches, totalMessages, pendingReports } });
  } catch {
    res.status(500).json({ success: false, error: "Erreur serveur" });
  }
});

router.get("/reports", requireAuth, async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const reports = await prisma.report.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
      include: {
        reporter: { include: { profile: { select: { firstName: true } } } },
        reported: { include: { profile: { select: { firstName: true } } } },
      },
    });
    res.json({ success: true, data: reports });
  } catch {
    res.status(500).json({ success: false, error: "Erreur serveur" });
  }
});

router.patch("/reports/:id/review", requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    await prisma.report.update({
      where: { id: req.params.id as string },
      data: { isReviewed: true },
    });
    res.json({ success: true });
  } catch {
    res.status(400).json({ success: false, error: "Signalement introuvable" });
  }
});

router.post("/ban/:userId", requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    await prisma.user.update({
      where: { id: req.params.userId as string },
      data: { isBanned: true, isActive: false },
    });
    await prisma.report.updateMany({
      where: { reportedId: req.params.userId as string },
      data: { isReviewed: true },
    });
    res.json({ success: true });
  } catch {
    res.status(400).json({ success: false, error: "Utilisateur introuvable" });
  }
});

export default router;
