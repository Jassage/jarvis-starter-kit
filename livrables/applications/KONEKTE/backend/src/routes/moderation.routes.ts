import { Router, Response } from "express";
import { requireAuth } from "../middlewares/auth.middleware";
import { AuthRequest } from "../types";
import {
  reportUserService,
  blockUserService,
  unblockUserService,
  getBlockedUsersService,
} from "../services/moderation.service";

const router = Router();

router.post("/report", requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { reportedId, reason, description } = req.body;
    if (!reportedId || !reason) {
      res.status(400).json({ success: false, error: "reportedId et reason requis" });
      return;
    }
    const report = await reportUserService(req.userId!, reportedId, reason, description);
    res.status(201).json({ success: true, data: report });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erreur serveur";
    res.status(400).json({ success: false, error: message });
  }
});

router.post("/block/:userId", requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    await blockUserService(req.userId!, req.params.userId as string);
    res.json({ success: true, message: "Utilisateur bloqué" });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erreur serveur";
    res.status(400).json({ success: false, error: message });
  }
});

router.delete("/block/:userId", requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    await unblockUserService(req.userId!, req.params.userId as string);
    res.json({ success: true, message: "Utilisateur débloqué" });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erreur serveur";
    res.status(400).json({ success: false, error: message });
  }
});

router.get("/blocked", requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const list = await getBlockedUsersService(req.userId!);
    res.json({ success: true, data: list });
  } catch (err: unknown) {
    res.status(500).json({ success: false, error: "Erreur serveur" });
  }
});

export default router;
