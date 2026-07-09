import { Router, Response } from "express";
import { requireAuth } from "../middlewares/auth.middleware";
import { AuthRequest } from "../types";
import { swipeService, getMatchesService, undoLastSwipeService, unmatchService, getLikesReceivedService, getSuperLikeRemainingService, activateBoostService } from "../services/swipe.service";

const router = Router();

router.post("/", requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { receiverId, action } = req.body;
    if (!receiverId || !action) {
      res.status(400).json({ success: false, error: "receiverId et action requis" });
      return;
    }
    const result = await swipeService(req.userId!, receiverId, action);
    res.json({ success: true, data: result });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erreur serveur";
    res.status(400).json({ success: false, error: message });
  }
});

router.delete("/undo", requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const result = await undoLastSwipeService(req.userId!);
    res.json({ success: true, data: result });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erreur serveur";
    res.status(400).json({ success: false, error: message });
  }
});

router.delete("/match/:matchId", requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    await unmatchService(req.userId!, req.params.matchId as string);
    res.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erreur serveur";
    res.status(400).json({ success: false, error: message });
  }
});

router.get("/likes-received", requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const likes = await getLikesReceivedService(req.userId!);
    res.json({ success: true, data: likes });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erreur serveur";
    res.status(500).json({ success: false, error: message });
  }
});

router.get("/super-likes-remaining", requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const result = await getSuperLikeRemainingService(req.userId!);
    res.json({ success: true, data: result });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erreur serveur";
    res.status(500).json({ success: false, error: message });
  }
});

router.post("/boost", requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const result = await activateBoostService(req.userId!);
    res.json({ success: true, data: result });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erreur serveur";
    res.status(400).json({ success: false, error: message });
  }
});

router.get("/matches", requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const matches = await getMatchesService(req.userId!);
    res.json({ success: true, data: matches });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erreur serveur";
    res.status(500).json({ success: false, error: message });
  }
});

export default router;
