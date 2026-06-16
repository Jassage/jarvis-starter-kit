import { Router, Response } from "express";
import { requireAuth } from "../middlewares/auth.middleware";
import { AuthRequest } from "../types";
import {
  getProfileService,
  updateProfileService,
  getUserNotifications,
  markNotificationsRead,
} from "../services/profile.service";

const router = Router();

router.get("/me", requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const profile = await getProfileService(req.userId!, req.userId!);
    res.json({ success: true, data: profile });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erreur serveur";
    res.status(404).json({ success: false, error: message });
  }
});

router.get("/:userId", requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const profile = await getProfileService(req.params.userId as string, req.userId!);
    res.json({ success: true, data: profile });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erreur serveur";
    res.status(404).json({ success: false, error: message });
  }
});

router.put("/me", requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const updated = await updateProfileService(req.userId!, req.body);
    res.json({ success: true, data: updated });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erreur serveur";
    res.status(400).json({ success: false, error: message });
  }
});

router.get("/me/notifications", requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const notifications = await getUserNotifications(req.userId!);
    res.json({ success: true, data: notifications });
  } catch (err: unknown) {
    res.status(500).json({ success: false, error: "Erreur serveur" });
  }
});

router.patch("/me/notifications/read", requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    await markNotificationsRead(req.userId!);
    res.json({ success: true });
  } catch (err: unknown) {
    res.status(500).json({ success: false, error: "Erreur serveur" });
  }
});

export default router;
